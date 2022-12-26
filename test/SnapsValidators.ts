import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
require('dotenv').config();

describe("Snaps Validators", function () {

  async function deploySnapsRegistryFixture() {
    const name = process.env.NAME || "";
    const symbol = process.env.SYMBOL || "";
    const snapName = process.env.SNAP_NAME || "";
    const snapUri = process.env.SNAP_URI || "";
    const snapVersion = process.env.SNAP_VERSION || "";
    const snapLocation = process.env.SNAP_LOCATION || "";
    const snapChecksum = process.env.SNAP_CHECKSUM || "";

    const [owner, otherAccount] = await ethers.getSigners();
    const validators:string[] = [owner.address];
    const members:string[] = [owner.address, otherAccount.address];

    const SnapsRegistry = await ethers.getContractFactory("PermissionlessRegistry");
    const snapsRegistry = await SnapsRegistry.deploy(name, symbol, validators);

    const SnapsValidators = await ethers.getContractFactory("SnapsValidators");
    const snapsValidators = await SnapsValidators.deploy(snapsRegistry.address, members);

    return { snapsRegistry, snapsValidators, owner, otherAccount, name, symbol, snapName, snapUri, snapVersion, snapLocation, snapChecksum };
  }


  describe("Change validator", function () {

    it("Should add a validator", async function () {
      const { snapsRegistry, snapsValidators, owner, otherAccount } = await loadFixture(deploySnapsRegistryFixture);
      await snapsRegistry.transferOwnership(snapsValidators.address);
      await snapsValidators.addValidator(otherAccount.address);
      await snapsValidators.connect(otherAccount).addValidator(otherAccount.address);
      console.log('res 1: ', await snapsRegistry.validators(owner.address));
      console.log('res 1: ', await snapsRegistry.validators(otherAccount.address));
    });

    it("Should remove a validator", async function () {
      const { snapsRegistry, snapsValidators, owner, otherAccount } = await loadFixture(deploySnapsRegistryFixture);
      await snapsRegistry.transferOwnership(snapsValidators.address);
      await snapsValidators.addValidator(otherAccount.address);
      await snapsValidators.connect(otherAccount).addValidator(otherAccount.address);
      await snapsValidators.removeValidator(otherAccount.address);
      await snapsValidators.connect(otherAccount).removeValidator(otherAccount.address);
      console.log('res 2: ', await snapsRegistry.validators(owner.address));
      console.log('res 3: ', await snapsRegistry.validators(otherAccount.address));
    });
  });


});