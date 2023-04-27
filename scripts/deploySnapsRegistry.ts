import { ethers } from "hardhat";

async function main() {

  const name = process.env.REGISTRY_NAME || "";
  const symbol = process.env.REGISTRY_SYMBOL || "";
  
  const SnapsRegistry = await ethers.getContractFactory("SnapsRegistry");
  console.log('deployment start');
  const snapRegistry = await SnapsRegistry.deploy(name, symbol);
  console.log('deployment finished');
  await snapRegistry.deployed();
  console.log(`[
    "${name}",
    "${symbol}",
  ]`);
  console.log(`Contract address: ${snapRegistry.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
