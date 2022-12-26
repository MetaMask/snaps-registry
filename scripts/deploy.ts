import { ethers } from "hardhat";

async function main() {

  const name = process.env.NAME || "";
  const symbol = process.env.SYMBOL || "";
  const validator1 = process.env.VALIDATOR1 || "";
  const validator2 = process.env.VALIDATOR2 || "";
  const validator3 = process.env.VALIDATOR3 || "";
  const validators = [validator1, validator2, validator3];
  
  const SnapsRegistry = await ethers.getContractFactory("PermissionlessRegistry");
  console.log('deployment start');
  const snapRegistry = await SnapsRegistry.deploy(name, symbol, validators);
  console.log('deployment finished');
  await snapRegistry.deployed();
  console.log(`[
    "${name}",
    "${symbol}",
    [${validators}]
  ]`);
  console.log(`Contract address: ${snapRegistry.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
