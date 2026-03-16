import "dotenv/config";
import { ethers } from "hardhat";
import { uploadFile, uploadJson } from "pinata";
import { generateCertificateSVG } from "../src/lib/certificate-generator";

const pinataConfig = {
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY_URL,
};
if (!pinataConfig.pinataJwt) {
  throw new Error("PINATA_JWT is required to upload certificate metadata to IPFS.");
}

async function pinFile(file: File): Promise<string> {
  const result = (await uploadFile(pinataConfig, file, "public")) as { IpfsHash?: string; cid?: string; hash?: string };
  const cid = result.IpfsHash || result.cid || result.hash;
  if (!cid) throw new Error("Pinata response missing CID");
  return `ipfs://${cid}`;
}

async function pinJSON(data: Record<string, unknown>): Promise<string> {
  const result = await uploadJson(pinataConfig, data, "public");
  const cid = (result as any).cid || (result as any).IpfsHash || (result as any).hash;
  if (!cid) throw new Error("Pinata response missing CID");
  return `ipfs://${cid}`;
}

async function main() {
  const recipient = process.env.MINT_RECIPIENT;
  if (!recipient) {
    throw new Error("Set MINT_RECIPIENT env var to the wallet address that should receive the NFT.");
  }

  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Set NFT_CONTRACT_ADDRESS in your .env (or env) to the deployed CourseNFT address.");
  }

  const recipientName = process.env.MINT_RECIPIENT_NAME || "Ayush Shetty";
  const courseSlug = process.env.MINT_COURSE_SLUG || "ens-101";
  const courseName = process.env.MINT_COURSE_NAME || "ENS 101: Ethereum Name Service Essentials";
  const courseLevel = process.env.MINT_COURSE_LEVEL || "Beginner";

  // Use an existing certificate SVG hosted on the public site
  // (Pinata uploads were returning `ipfs://undefined` for the image field.)
  const imageUri =
    process.env.MINT_IMAGE_URI ||
    "https://ethed.app/local-metadata/cert-ens-101-1772811714430.svg";

  const metadata = {
    name: `${courseName} - ${recipientName}`,
    description: `Certificate of completion for ${courseName}, awarded to ${recipientName}.`,
    image: imageUri,
    courseSlug,
    courseName,
    attributes: [
      { trait_type: "Type", value: "Course Completion" },
      { trait_type: "Course", value: courseName },
      { trait_type: "Recipient", value: recipientName },
      { trait_type: "Level", value: courseLevel },
      { trait_type: "Completion Date", value: new Date().toISOString().split("T")[0] },
    ],
    external_url: "https://ethed.app",
  };

  const metadataUri = await pinJSON(metadata);

  console.log("📍 Minting to:", recipient);
  console.log("🎯 Contract:", contractAddress);
  console.log("🧾 Metadata URI:", metadataUri);

  const [deployer] = await ethers.getSigners();
  console.log("🧑‍💼 Using deployer:", deployer.address);

  const nft = await ethers.getContractAt("CourseNFT", contractAddress, deployer);
  const tx = await nft.mint(recipient, metadataUri);
  console.log("⛓ Transaction:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Mint confirmed (status):", receipt.status);
  console.log("🎉 NFT should arrive in the recipient's wallet shortly.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
