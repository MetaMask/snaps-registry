import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
require('dotenv').config();

const DID_ETHR_SCHEME = 'did:ethr:goerli:'

describe("Verifiable Data Registry", function () {

  async function deployVerifiableDataRegistryFixture() {
    const [ownerAccount, account2, account3, account4, account5] = await ethers.getSigners();
    
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const Contract = await ethers.getContractFactory("SimpleVerifiableDataRegistry");
    const contract = await Contract.deploy();
    const subjectDID = DID_ETHR_SCHEME + account2.address;
    const issuerDID = DID_ETHR_SCHEME + ownerAccount.address;
    const credentialInfo = {
      subjectDID: subjectDID,
      expirationTime: '1698118071',
      claim: 2
    }
    const eip712Domain = {
      name: "VerifiableDataRegistry",
      version: "0.1",
      chainId: chainId,
      verifyingContract: contract.address
    };
    const eip712Types = {
      VerifiableCredentialInfo: [
        {name: 'subjectDID', type: 'string'},
        {name: 'claim', type: 'uint8'},
        {name: 'expirationTime', type: 'uint256'},
      ]
    };
    const eip712Values = {
      subjectDID: credentialInfo.subjectDID,
      claim: credentialInfo.claim,
      expirationTime: credentialInfo.expirationTime,
    };

    console.log('\n== start Fixtures ==');
    console.log('log: owner account: ', ownerAccount.address);
    console.log('log: account 2: ', account2.address);
    console.log('log: account 3: ', account3.address);
    console.log('log: subject DID: ', subjectDID);
    console.log('log: issuer DID: ', issuerDID);
    console.log('== end Fixtures ==\n');

    return { contract, ownerAccount, account2, account3, account4, account5, chainId, credentialInfo, eip712Domain, eip712Types, eip712Values, subjectDID, issuerDID };
  }


  describe("Verifiable Data Registry deployment", function () {

    it("Should set the right admins", async function () {
      const { contract, ownerAccount, account2 } = await loadFixture(deployVerifiableDataRegistryFixture);

      expect(await contract.hasRole(ethers.utils.formatBytes32String(''), ownerAccount.address)).to.equal(true);
      expect(await contract.hasRole(ethers.utils.formatBytes32String(''), account2.address)).to.equal(false);
      await contract.grantRole(ethers.utils.formatBytes32String(''), account2.address);
      expect(await contract.hasRole(ethers.utils.formatBytes32String(''), account2.address)).to.equal(true);
    });
  });
  

  describe("Verified Credential recording", function () {
    
    it('Should register a credential', async() => {
      const { contract, ownerAccount, credentialInfo, eip712Domain, eip712Types, eip712Values } = await loadFixture(deployVerifiableDataRegistryFixture);

      const signature = await ownerAccount._signTypedData(eip712Domain, eip712Types, eip712Values);

      await contract.registerCredential(credentialInfo, ownerAccount.address, signature);
    });

  });

    it('Should retrieve credentials of a subject', async() => {
      const { contract, ownerAccount, credentialInfo, eip712Domain, eip712Types, eip712Values, subjectDID } = await loadFixture(deployVerifiableDataRegistryFixture);

      const signature = await ownerAccount._signTypedData(eip712Domain, eip712Types, eip712Values);

      await contract.registerCredential(credentialInfo, ownerAccount.address, signature);
      const credentials = await contract.getCredentialsForSubject(subjectDID);
      expect(credentials[0]['claim']).to.equal(credentialInfo.claim);
      console.log('log: credential claim: ', credentials[0]['claim'],'\n');
    });

    it('Should retrieve credentials of an issuer', async() => {
      const { contract, ownerAccount, credentialInfo, eip712Domain, eip712Types, eip712Values, issuerDID } = await loadFixture(deployVerifiableDataRegistryFixture);

      const signature = await ownerAccount._signTypedData(eip712Domain, eip712Types, eip712Values);

      await contract.registerCredential(credentialInfo, ownerAccount.address, signature);
      const credentials = await contract.getCredentialsForIssuer(ownerAccount.address);
      expect(credentials[0]['claim']).to.equal(credentialInfo.claim);
    });

});