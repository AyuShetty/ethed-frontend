// @ts-ignore
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deployment script for CourseNFT contract on Polygon mainnet
 * 
 * Usage:
 * - Development/Testnet: npx hardhat run scripts/deploy-polygon.ts --network polygonAmoy
 * - Production: npx hardhat run scripts/deploy-polygon.ts --network polygon
 * 
 * Requirements:
 * - DEPLOYER_PRIVATE_KEY in .env
 * - POLYGON_RPC_URL in .env (for mainnet)
 * - Sufficient gas (MATIC) in deployer wallet
 */

async function main() {
  console.log("🚀 Deploying CourseNFT contract...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📍 Deployer address: ${deployer.address}`);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInMatic = ethers.formatEther(balance);
  console.log(`💰 Deployer balance: ${balanceInMatic} MATIC\n`);

  if (parseFloat(balanceInMatic) < 0.1) {
    throw new Error("❌ Insufficient balance. Need at least 0.1 MATIC for deployment.");
  }

  // Deploy contract
  console.log("📦 Deploying CourseNFT contract...");
  const CourseNFT = await ethers.getContractFactory("CourseNFT");
  const contract = await CourseNFT.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = (contract as any).target || (contract as any).address;
  
  console.log(`✅ CourseNFT deployed at: ${contractAddress}\n`);

  // Get network info
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "maticmum" ? "polygonAmoy" : network.name === "matic" ? "polygon" : network.name;
  
  console.log(`🌐 Network: ${networkName} (Chain ID: ${network.chainId})`);
  console.log(`📝 Deployer: ${deployer.address}\n`);

  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: Number(network.chainId),
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: Number(await ethers.provider.getBlockNumber()),
  };

  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = path.join(deploymentsDir, `CourseNFT-${networkName}-${Date.now()}.json`);
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${filename}\n`);

  // Output for .env
  console.log("📌 Add this to your .env file:");
  console.log(`NFT_CONTRACT_ADDRESS=${contractAddress}\n`);

  // Verification instructions
  console.log("🔍 To verify on Polygonscan:");
  if (networkName === "polygon") {
    console.log(`   https://polygonscan.com/address/${contractAddress}`);
  } else {
    console.log(`   https://amoy.polygonscan.com/address/${contractAddress}`);
  }
  
  console.log("\n✨ Deployment complete!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
