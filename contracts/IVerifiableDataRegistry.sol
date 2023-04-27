// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IVerifiableDataRegistry {

  ///////
  /// States
  //////

  struct Identity {
    string name;
    string organization;
    string url;
  }

  /// @dev 
  struct VerifiableCredentialInfo {
    string subjectDID;
    uint256 expirationTime;
    Claim claim;
  }

  struct VerifiedCredential {
    bytes32 uuid;
    string issuerDID;
    string subjectDID;
    Claim claim;
    uint256 creationTime;
    uint256 expirationTime;
    bool revoked;
  }

  enum Claim { NACK, ACK, SACK }


  ///////
  /// Events
  //////
  event CredentialVerified(VerifiedCredential verifiedCredential);
  event CredentialRevoked(bytes32 uuid);
  event CredentialRemoved(bytes32 uuid);

  //////
  /// Errors
  //////  
  error CredentialCanNotBeVerified(VerifiableCredentialInfo credentialInfo, bytes signature);
  error ExpiredCredential(uint256 expiracyDate, uint256 date);
  error MsgSenderMustBeIssuer(string issuerDID, string msgSenderDID);
  error CredentialMustNotExist(bytes32 uuid);
  
  //////
  /// Functions
  //////
  function registerCredential(VerifiableCredentialInfo memory credentialInfo, address signer, bytes memory signature) external returns (bytes32);

  function getVerififiedCredential(bytes32 uuid) external view returns (VerifiedCredential memory);

  function getCredentialsForSubject(string memory did) external view returns (VerifiedCredential[] memory);

  function getCredentialsForIssuer(address issuerAddress) external view returns (VerifiedCredential[] memory);

  function revokeVerifiedCredential(bytes32 uuid) external;
}