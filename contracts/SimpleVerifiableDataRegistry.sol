// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./IVerifiableDataRegistry.sol";
import "hardhat/console.sol";

contract SimpleVerifiableDataRegistry is IVerifiableDataRegistry, EIP712("VerifiableDataRegistry", "0.1"), AccessControl {

  using Strings for uint256; 

  mapping(bytes32 => VerifiedCredential) private _verifiedCredentials;
  mapping(string => bytes32[]) private _verificationsForSubject;
  mapping(address => bytes32[]) private _verificationsForIssuer;
  mapping(string => Identity) private _verifiedIdentities;

  string constant DID_ETHR_SCHEME = 'did:ethr:goerli:';

  constructor() {
    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

  /// Register the verification of a credential
  /// @notice anyone can add a credential verification
  /// @param credentialInfo Payload of the issued Verifiable Credential (the subject can be an address, but also a snap version or an audit)
  /// @param signature Cryptographic proof given by the Credential issuer
  function registerCredential(VerifiableCredentialInfo memory credentialInfo, address signer, bytes memory signature) public returns (bytes32) {
    /// Verify Credential
    VerifiedCredential memory verifiedCredential = _verifyCredential(credentialInfo, signer, signature);

    /// Register Credential
    _verifiedCredentials[verifiedCredential.uuid] = verifiedCredential;
    _verificationsForSubject[verifiedCredential.subjectDID].push(verifiedCredential.uuid);
    _verificationsForIssuer[signer].push(verifiedCredential.uuid);
    
    return verifiedCredential.uuid;
  }

  /// Verify the verifiable credential
  /// @param credentialInfo Payload of the issued Verifiable Credential (the subject can be an address, but also a snap version or an audit)
  /// @param signature Cryptographic proof given by the Credential issuer
  /// @return verifiedCredential verified credential information
  function _verifyCredential(VerifiableCredentialInfo memory credentialInfo, address signer, bytes memory signature) private view returns(VerifiedCredential memory){
    /// Generate the signed payload and recover the signer address
    bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
        keccak256("VerifiableCredentialInfo(string subjectDID,uint8 claim,uint256 expirationTime)"),
        keccak256(bytes(credentialInfo.subjectDID)),
        credentialInfo.claim,
        credentialInfo.expirationTime
    )));
    address recoveredAddress = ECDSA.recover(digest, signature);

    /// Verification of the credential validity
    if (recoveredAddress != signer) revert CredentialCanNotBeVerified(credentialInfo, signature);
    if (credentialInfo.expirationTime < block.timestamp) revert ExpiredCredential(credentialInfo.expirationTime, block.timestamp);

    /// Creation of the verified credential object
    VerifiedCredential memory verifiedCredential = VerifiedCredential({
      uuid: 0,
      issuerDID: _generateDID(signer),
      subjectDID: credentialInfo.subjectDID,
      claim: credentialInfo.claim,
      creationTime: block.timestamp,
      expirationTime: credentialInfo.expirationTime,
      revoked: false
    });

    bytes32 uuid = _createVerifiedCredentialUUID(verifiedCredential);
    verifiedCredential.uuid = uuid;

    return verifiedCredential;
  }

  /// Generate a decentralized identifier (`ethr` method) from the address
  /// @param identityAddress Address to be converted in DID
  function _generateDID(address identityAddress) internal view returns (string memory did) {

    console.log('\n== start solidity debug (_generateDID) ==');
    console.log('function: registerCredential()');
    console.log(string.concat(DID_ETHR_SCHEME, Strings.toHexString(uint256(uint160(identityAddress)), 20)));
    console.log('== end solidity debug ==\n');

    return string.concat(DID_ETHR_SCHEME, Strings.toHexString(uint256(uint160(identityAddress)), 20));
  }

  /// Generate an UUID from the verified credential information
  /// @param verifiedCredential Verified credential information
  function _createVerifiedCredentialUUID(VerifiedCredential memory verifiedCredential) private pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        verifiedCredential.issuerDID,
        verifiedCredential.subjectDID,
        verifiedCredential.claim,
        verifiedCredential.expirationTime
      )
    );
  }

  function getVerififiedCredential(bytes32 uuid) public view returns (VerifiedCredential memory) {
    return _verifiedCredentials[uuid];
  }

  /// Retrieve all the verified credentials of a given subject identified with a did
  /// @param did Decentralized identifier of the subject
  /// @return verifiedCredentials list of verified credentials issued for the subject
  function getCredentialsForSubject(string memory did) public view returns (VerifiedCredential[] memory) {
    bytes32[] memory verifiedCredentialUUIDs = _verificationsForSubject[did];
    VerifiedCredential[] memory records = new VerifiedCredential[](verifiedCredentialUUIDs.length);

    for (uint i = 0; i < verifiedCredentialUUIDs.length; i++) {
        VerifiedCredential memory record = _verifiedCredentials[verifiedCredentialUUIDs[i]];
        records[i] = record;
    }
    return records;
  }

  /// Retrieve all the verified credentials of a given issuer identified with a did
  /// @param issuerAddress Address of the credential issuer
  /// @return verifiedCredentials list of verified credentials issued by the issuer
  function getCredentialsForIssuer(address issuerAddress) public view returns (VerifiedCredential[] memory) {
    bytes32[] memory verifiedCredentialUUIDs = _verificationsForIssuer[issuerAddress];

      VerifiedCredential[] memory records = new VerifiedCredential[](verifiedCredentialUUIDs.length);
      for (uint i = 0; i < verifiedCredentialUUIDs.length; i++) {
          VerifiedCredential memory record = _verifiedCredentials[verifiedCredentialUUIDs[i]];
          records[i] = record;
      }
      return records;
  }

  function revokeVerifiedCredential(bytes32 uuid) external {
    _verifiedCredentials[uuid].revoked = true;
  }

  /// Register identity information
  /// @notice identity are just created for information purpose by the contract's owners
  /// @param identity address verified
  /// @param identityInfo identiy information
  function registerIdentity(address identity, Identity memory identityInfo ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    /// Generate DID from Public Address
    string memory identityDID = _generateDID(identity);
    _verifiedIdentities[identityDID].name = identityInfo.name;
    _verifiedIdentities[identityDID].organization = identityInfo.organization;
    _verifiedIdentities[identityDID].url = identityInfo.url;
  }
}