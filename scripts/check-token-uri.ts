import "dotenv/config";
import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error("Set NFT_CONTRACT_ADDRESS in .env");
  const tokenId = process.env.CHECK_TOKEN_ID ? Number(process.env.CHECK_TOKEN_ID) : 5;

  const [deployer] = await ethers.getSigners();
  const nft = await ethers.getContractAt("CourseNFT", contractAddress, deployer);

  const uri = await nft.tokenURI(tokenId);
  console.log(`tokenURI(${tokenId}) =`, uri);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
