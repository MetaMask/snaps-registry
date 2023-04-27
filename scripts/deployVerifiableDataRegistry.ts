import { ethers } from "hardhat";

async function main() {
  
  const VerifiableDataRegistry = await ethers.getContractFactory("VerifiableDataRegistry");
  console.log('deployment start');
  const verifiableDataRegistry = await VerifiableDataRegistry.deploy();
  console.log('deployment finished');
  await verifiableDataRegistry.deployed();
  console.log(`Contract address: ${verifiableDataRegistry.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
