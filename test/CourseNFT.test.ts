import { expect } from "chai";
import { ethers } from "hardhat";
import { CourseNFT as CourseNFTType } from "../typechain-types";

describe("CourseNFT", function () {
  it("Should deploy and initialize correctly", async function () {
    const CourseNFT = await ethers.getContractFactory("CourseNFT");
    const contract = (await CourseNFT.deploy()) as CourseNFTType;
    await contract.waitForDeployment();

    const [deployer] = await ethers.getSigners();

    // Check if deployer is a minter
    const isMinter = await contract.isMinter(deployer.address);
    expect(isMinter).to.equal(true);

    // Check name and symbol
    const name = await contract.name();
    const symbol = await contract.symbol();
    
    expect(name).to.equal("EIPsInsight Course Certificate");
    expect(symbol).to.equal("EIPS-CERT");
  });

  it("Should mint an NFT with URI", async function () {
    const CourseNFT = await ethers.getContractFactory("CourseNFT");
    const contract = (await CourseNFT.deploy()) as CourseNFTType;
    await contract.waitForDeployment();

    const [deployer, recipient] = await ethers.getSigners();

    // Mint an NFT
    const tx = await contract.mint(
      recipient.address,
      "ipfs://QmX..."
    );

    const receipt = await tx.wait();
    expect(receipt?.status).to.equal(1);

    // Check balance
    const balance = await contract.balanceOf(recipient.address);
    expect(balance).to.equal(1n);
  });

  it("Should mint with ENS name", async function () {
    const CourseNFT = await ethers.getContractFactory("CourseNFT");
    const contract = (await CourseNFT.deploy()) as CourseNFTType;
    await contract.waitForDeployment();

    const [deployer, recipient] = await ethers.getSigners();

    // Mint with ENS
    const tx = await contract.mintWithENS(
      recipient.address,
      "ipfs://QmX...",
      "alice.ayushetty.eth"
    );

    const receipt = await tx.wait();
    expect(receipt?.status).to.equal(1);

    const balance = await contract.balanceOf(recipient.address);
    expect(balance).to.equal(1n);
  });

  it("Should only allow minters to mint", async function () {
    const CourseNFT = await ethers.getContractFactory("CourseNFT");
    const contract = (await CourseNFT.deploy()) as CourseNFTType;
    await contract.waitForDeployment();

    const [deployer, recipient, nonMinter] = await ethers.getSigners();

    // Non-minter should not be able to mint
    await expect(
      contract.connect(nonMinter).mint(recipient.address, "ipfs://QmX...")
    ).to.be.revertedWith("Only minters can call this function");
  });
});
