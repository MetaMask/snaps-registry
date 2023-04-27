import { ethers } from "hardhat";

async function main() {

  const name = process.env.AUDIT_NAME || "";
  const symbol = process.env.AUDIT_SYMBOL || "";
  const snapsRegistryAddress = process.env.SNAPS_REGISTRY_ADDRESS || "";
  
  const SnapsRegistry = await ethers.getContractFactory("SnapsAuditTrail");
  console.log('deployment start');
  const snapRegistry = await SnapsRegistry.deploy(name, symbol, snapsRegistryAddress);
  console.log('deployment finished');
  await snapRegistry.deployed();
  console.log(`[
    "${name}",
    "${symbol}",
    "${snapsRegistryAddress}",
  ]`);
  console.log(`Contract address: ${snapRegistry.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
