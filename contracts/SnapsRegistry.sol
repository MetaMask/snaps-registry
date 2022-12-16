// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import 'hardhat/console.sol';

error InvalidSnapId(uint256 id);
error InvalidSnapName(string name);
error InvalidSnapVersion(string version);
error InvalidSnapLocation(string location);
error InvalidChecksum(string checksum);
error OnlyValidators(address signingAddress);
error OnlySnapOwner(address snapOwner, address msgSender);

contract MyRegistry is Context, Ownable {

  using ECDSA for bytes32;
  using Counters for Counters.Counter;
  Counters.Counter public totalSnaps;

  event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

  string public name;
  string public symbol;

  struct Snap {
    string name;
    address owner;
    string uri;
    string[] recordedVersions;
    mapping(string => Version) versions;
  }

  struct Version {
    string location;
    string checksum;
    Status status;
    Risk risk;
  }

  enum Risk { LOW, MEDIUM, HIGH }

  enum Status { UNVERIFIED, VERIFIED, PAUSED, BLOCKED, DEPRECATED }

  mapping(uint256 => Snap) public recordedSnaps;
  mapping(address => bool) public validators;

  constructor (string memory name_, string memory symbol_, address[] memory validators_) {
    name = name_;
    symbol = symbol_;
    setValidators(validators_);
  }

    /// Record a new snap
    /// @param owner owner of the snap
    /// @param snapName unique name of the snap
    /// @param version current version of the snap
    /// @param location location of the snap
    /// @param checksum checksum of the snap
  function create(address owner, string memory snapName, string memory uri, string memory version, string memory location, string memory checksum) external {

    Snap storage newSnap = recordedSnaps[totalSnaps.current()];
    Version storage newVersion = recordedSnaps[totalSnaps.current()].versions[version];

    newSnap.owner = owner;
    newSnap.name = snapName;
    newSnap.uri = uri;
    newSnap.recordedVersions.push(version);
    newVersion.status = Status.UNVERIFIED;
    newVersion.location = location;
    newVersion.checksum = checksum;

    emit Transfer(address(0), owner, totalSnaps.current());

    totalSnaps.increment();
  }

  /// Get general snap information
  /// @param snapId identifier of the snap
  function snap(uint256 snapId) public view returns(string memory, address, string memory, string[] memory) {
    return (recordedSnaps[snapId].name, recordedSnaps[snapId].owner, recordedSnaps[snapId].uri, recordedSnaps[snapId].recordedVersions);
  }

  /// Get specific snap version information
  /// @param snapId identifier of the snap
  /// @param version version of the snap
  function snapVersion(uint256 snapId, string memory version) public view returns(string memory, string memory, string memory, string memory, Status, Risk) {
    return (recordedSnaps[snapId].name, recordedSnaps[snapId].uri, recordedSnaps[snapId].versions[version].location, recordedSnaps[snapId].versions[version].checksum, recordedSnaps[snapId].versions[version].status, recordedSnaps[snapId].versions[version].risk);
  }

  function snapStatus(uint256 snapId, string memory version) public view returns(Status) {
    return recordedSnaps[snapId].versions[version].status;
  }

  function snapAssessement(uint256 snapId, string memory version) public view returns(Risk) {
    return recordedSnaps[snapId].versions[version].risk;
  }

  /// Set snap uri
  function setURI(uint256 snapId, string memory uri) external {
    if (!_isOwner(_msgSender(), snapId)) revert OnlySnapOwner(recordedSnaps[snapId].owner, _msgSender());
    recordedSnaps[snapId].uri = uri;
  }

  /// Change snap owner
  function setOwner(uint256 snapId, address owner) external {
    if (!_isOwner(_msgSender(), snapId)) revert OnlySnapOwner(recordedSnaps[snapId].owner, _msgSender());
    recordedSnaps[snapId].owner = owner;
  }

  /// Assess the risk of snap version
  /// @param version current version of the snap
  /// @param risk risk assessement of the snap
  /// @param signature signature of the validators
  function assessement(uint256 snapId, string memory version, Risk risk, bytes memory signature) external {
    bytes32 domainSeparator = 
      keccak256(abi.encode(
        keccak256("EIP712Domain(string name,address verifyingContract)"),
        keccak256(
          bytes("Snap Assessement")), 
          address(this)));

    bytes32 structHash = 
      keccak256(abi.encode(
        keccak256("Validate(uint256 identifier,string name,string location,string checksum,uint256 risk)"),
        snapId, 
        keccak256(bytes(recordedSnaps[snapId].name)), 
        keccak256(bytes(recordedSnaps[snapId].versions[version].location)), 
        keccak256(bytes(recordedSnaps[snapId].versions[version].checksum)),
        uint256(risk)));
    bytes32 digest = ECDSA.toTypedDataHash(domainSeparator, structHash);
    address signingAddress = ECDSA.recover(digest, signature);
    if(!_isValidator(signingAddress)) revert OnlyValidators(signingAddress);
    recordedSnaps[snapId].versions[version].risk = risk;
  }

  
    /// Validate a snap version
    /// @param version current version of the snap
    /// @param status_ status of the snap
    /// @param signature signature of the validators
  function validate(uint256 snapId, string memory version, Status status_, bytes memory signature) external {
    bytes32 domainSeparator = 
      keccak256(abi.encode(
        keccak256("EIP712Domain(string name,address verifyingContract)"),
        keccak256(
          bytes("Snap Validation")), 
          address(this)));

    bytes32 structHash = 
      keccak256(abi.encode(
        keccak256("Validate(uint256 identifier,string name,string location,string checksum)"),
        snapId, 
        keccak256(bytes(recordedSnaps[snapId].name)), 
        keccak256(bytes(recordedSnaps[snapId].versions[version].location)), 
        keccak256((bytes(recordedSnaps[snapId].versions[version].checksum)))));
    
    bytes32 digest = ECDSA.toTypedDataHash(domainSeparator, structHash);
    address signingAddress = ECDSA.recover(digest, signature);
    if(!_isValidator(signingAddress)) revert OnlyValidators(signingAddress);
    recordedSnaps[snapId].versions[version].status = status_;
  }

  /// Set authorized snap validators
  function setValidators(address[] memory validators_) public onlyOwner {
    for(uint256 i = 0; i < validators_.length; i++) {
      validators[validators_[i]] = true;
    }
  }

  function _isValidator(address signingAddress) internal view returns(bool) {
    return validators[signingAddress] == true;
  }

  /// Add a validator
  function addValidator(address validator) external onlyOwner {
    validators[validator] = true;
  }

  /// Remove a validator
  function removeValidator(address validator) external onlyOwner {
    validators[validator] = false;
  }

  function change(uint256 snapId, string memory version, string memory location, string memory checksum) external {
    if (!_isOwner(_msgSender(), snapId)) revert OnlySnapOwner(recordedSnaps[snapId].owner, _msgSender());
    recordedSnaps[snapId].recordedVersions.push(version);
    recordedSnaps[snapId].versions[version].status = Status.UNVERIFIED;
    recordedSnaps[snapId].versions[version].location = location;
    recordedSnaps[snapId].versions[version].location = checksum;
  }

  function _isOwner(address requester, uint256 snapId) internal view returns (bool) {
    if(requester == recordedSnaps[snapId].owner) {
      return true; 
    } else {
      return false;
    }
  }

  /// Pause a snap
  /// @param snapId Snap identifier
  /// @param version version of the snap
  function pause(uint256 snapId, string memory version) external {
    if (!_isOwner(_msgSender(), snapId)) revert OnlySnapOwner(recordedSnaps[snapId].owner, _msgSender());
    recordedSnaps[snapId].versions[version].status = Status.PAUSED;
  }

  /// Depracate a snap
  /// @param snapId Snap identifier
  /// @param version version of the snap
  function deprecate(uint256 snapId, string memory version) external {
    if (!_isOwner(_msgSender(), snapId)) revert OnlySnapOwner(recordedSnaps[snapId].owner, _msgSender());
    recordedSnaps[snapId].versions[version].status = Status.DEPRECATED;
  }

  /// Block a snap
  /// @param snapId Snap identifier
  /// @param version version of the snap
  function block_(uint256 snapId, string memory version) external {
    if (!_isOwner(_msgSender(), snapId)) revert OnlySnapOwner(recordedSnaps[snapId].owner, _msgSender());
    recordedSnaps[snapId].versions[version].status = Status.BLOCKED;
  }


  /// Returns whether the snap is validated
  /// @param snapId identifier of the snap
  /// @param version version of the snap
  function isValidated(uint256 snapId, string memory version) public view returns(bool) {
    return recordedSnaps[snapId].versions[version].status == Status.VERIFIED;
  }

  /// @dev Returns the Uniform Resource Identifier (URI) for `snapId` token.
  function tokenURI(uint256 snapId) public view virtual returns (string memory) {
      if(!_exists(snapId)) revert InvalidSnapId(snapId);
      return recordedSnaps[snapId].uri;
  }


  /// @dev Returns whether `tokenId` exists.
  function _exists(uint256 snapId) internal view virtual returns (bool) {
        return recordedSnaps[snapId].owner != address(0);
    }
}
