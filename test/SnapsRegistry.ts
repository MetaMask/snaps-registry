import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
require('dotenv').config();

describe("Snaps Registry", function () {

  async function deploySnapsRegistryFixture() {
    const name = process.env.NAME || "";
    const symbol = process.env.SYMBOL || "";
    const snapName = process.env.SNAP_NAME || "";
    const snapUri = process.env.SNAP_URI || "";
    const snapVersion = process.env.SNAP_VERSION || "";
    const snapLocation = process.env.SNAP_LOCATION || "";
    const snapChecksum = process.env.SNAP_CHECKSUM || "";

    const [owner, otherAccount] = await ethers.getSigners();
    const validators:string[] = [otherAccount.address, owner.address];

    const Contract = await ethers.getContractFactory("MyRegistry");
    const contract = await Contract.deploy(name, symbol, validators);

    return { contract, owner, otherAccount, name, symbol, snapName, snapUri, snapVersion, snapLocation, snapChecksum };
  }


  describe("Snaps Registry deployment", function () {

    it("Should set the right owner", async function () {
      const { contract, owner } = await loadFixture(deploySnapsRegistryFixture);
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should set the right metadata", async function () {
      const { contract, name, symbol } = await loadFixture(deploySnapsRegistryFixture);
      expect(await contract.name()).to.equal(name);
      expect(await contract.symbol()).to.equal(symbol);
    });

  });


  describe("Snap creation", function () {

    it('Should have the right Snap metadata', async() => {
      const { contract, owner, snapName, snapUri, snapVersion, snapLocation, snapChecksum } = await loadFixture(deploySnapsRegistryFixture);
      const snapId = 0;
      await contract.create(owner.address, snapName, snapUri, snapVersion, snapLocation, snapChecksum);
    });

    it('Should have the right Snap metadata', async() => {
      const { contract, owner, snapName, snapUri, snapVersion, snapLocation, snapChecksum } = await loadFixture(deploySnapsRegistryFixture);
      const snapId = 0;
      const snapStatus = 0;
      const snapRisk = 0;
      await contract.create(owner.address, snapName, snapUri, snapVersion, snapLocation, snapChecksum);
      expect(await contract.snap(snapId)).to.deep.equal([snapName, owner.address, snapUri, [snapVersion]]);
      expect(await contract.snapVersion(snapId, snapVersion)).to.deep.equal([snapName, snapUri, snapLocation, snapChecksum, snapStatus, snapRisk]);
    });
    
  });


  describe("Snap update", function () {

    it('Should have the right changed Snap metadata', async() => {
      const { contract, owner, otherAccount, snapName, snapUri, snapVersion, snapLocation, snapChecksum } = await loadFixture(deploySnapsRegistryFixture);
      const snapId = 0;
      const newURI = "ipfs://newuri"
      const otherAddress = otherAccount.address;
      await contract.create(owner.address, snapName, snapUri, snapVersion, snapLocation, snapChecksum);
      contract.setURI(snapId, newURI);
      contract.setOwner(snapId, otherAddress);
      expect(await contract.snap(snapId)).to.deep.equal([snapName, otherAddress, newURI, [snapVersion]]);
    });

    it('Should have the right Snap metadata', async() => {
      const { contract, owner, otherAccount, snapName, snapUri, snapVersion, snapLocation, snapChecksum } = await loadFixture(deploySnapsRegistryFixture);
      const snapId = 0;
      const newURI = "ipfs://newuri"
      const snapStatus = 0;
      const otherAddress = otherAccount.address;
      await contract.create(owner.address, snapName, snapUri, snapVersion, snapLocation, snapChecksum);
      contract.setURI(snapId, newURI);
      contract.setOwner(snapId, otherAddress);
      expect(await contract.snap(snapId)).to.deep.equal([snapName, otherAddress, newURI, [snapVersion]]);
    });

    it('Should update the snap version', async() => {
      const { contract, owner, snapName, snapUri, snapVersion, snapLocation, snapChecksum } = await loadFixture(deploySnapsRegistryFixture);
      const snapId = 0;
      const newLocation = "npm:newlocation";
      const newsnapChecksum = "123";
      await contract.create(owner.address, snapName, snapUri, snapVersion, snapLocation, snapChecksum);
      await contract.connect(owner).change(snapId, snapVersion, newLocation, newsnapChecksum);
    });

  });

  describe("Snap assessement & validation", function () {

    it('Should assess the snap', async() => {
      const { contract, owner, otherAccount, snapName, snapUri, snapVersion, snapLocation, snapChecksum } = await loadFixture(deploySnapsRegistryFixture);
      const snapId = 0;
      await contract.create(owner.address, snapName, snapUri, snapVersion, snapLocation, snapChecksum);
      const risk = 1;

      const domain = {
        name: "Snap Assessement",
        verifyingContract: contract.address
      };
      const types = {
        Validate: [
          {name: 'identifier', type: 'uint256'},
          {name: 'name', type: 'string'},
          {name: 'location', type: 'string'},
          {name: 'checksum', type: 'string'},
          {name: 'risk', type: 'uint256'},
        ]
      };
      const value = {
        identifier: snapId,
        name: snapName,
        location: snapLocation,
        checksum: snapChecksum,
        risk: risk,
      };
      const signature = await owner._signTypedData(domain, types, value);
      await contract.connect(owner).assessement(snapId, snapVersion, risk, signature);
      expect(await contract.snapAssessement(snapId, snapVersion)).to.equal(risk);
    });

    it('Should validate the snap', async() => {
      const { contract, owner, otherAccount, snapName, snapUri, snapVersion, snapLocation, snapChecksum } = await loadFixture(deploySnapsRegistryFixture);
      const snapId = 0;
      const validationStatus = 1;
      await contract.create(owner.address, snapName, snapUri, snapVersion, snapLocation, snapChecksum);
      const domain = {
        name: "Snap Validation",
        verifyingContract: contract.address
      };
      const types = {
        Validate: [
          {name: 'identifier', type: 'uint256'},
          {name: 'name', type: 'string'},
          {name: 'location', type: 'string'},
          {name: 'checksum', type: 'string'},
        ]
      };
      const value = {
        identifier: snapId,
        name: snapName,
        location: snapLocation,
        checksum: snapChecksum,
      };
      const signature = await owner._signTypedData(domain, types, value);
      await contract.connect(owner).validate(snapId, snapVersion, validationStatus, signature);
      expect(await contract.snapStatus(snapId, snapVersion)).to.equal(validationStatus);
    });
  });

});