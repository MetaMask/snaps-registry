import { ethers } from "hardhat";

async function main() {

  const name = "MyRegistry";
  const symbol = "MYR";
  const validator1 = process.env.VALIDATOR1 || "";
  const validator2 = process.env.VALIDATOR2 || "";
  const validators = [validator1, validator2];
  
  const SnapsRegistry = await ethers.getContractFactory("MyRegistry");
  const snapRegistry = await SnapsRegistry.deploy(name, symbol, validators);

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
