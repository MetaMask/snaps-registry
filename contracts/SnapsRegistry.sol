// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./libs/Base64.sol";
import "hardhat/console.sol";

/**
 * @title  SnapRegistry
 * @notice Snap Registry is a contract to help facilitate snap permissionless distribution
 */
contract SnapsRegistry is ERC721, AccessControl {

  /// Snaps counter
  using Counters for Counters.Counter;
  Counters.Counter public snapsIndex;

  /// Snap data structure
  struct Snap {
    string name;
    string description;
    string author;
    uint256 category;
    string docUrl;
    string[] recordedVersions;
    mapping(string => bool) releasedVersions;
    mapping(string => Version) versions;
    mapping(address => bool) consents;
  }

  /// Snap version data structure
  struct Version {
    string location;
    string checksum;
    string signature;
    string changeLog;
    Status status;
    string statusReason;
    bool isAttested;
  }

  /// Snap version status
  enum Status { LIVE, PAUSED, DEPRECATED }

  /// Snaps state
  mapping(uint256 => Snap) public snaps;

  // events
  event SnapCreated(uint256 indexed snapId, address indexed owner, string name, string description, string author, uint256 category, string docUrl);
  event SnapVersionReleased(uint256 indexed snapId, string indexed versionHash, string indexed locationHash, string version, string location, string checksum, string signature, string changeLog);
  event SnapStatusChanged(uint256 indexed snapId, string indexed version, Status status, string reason);
  event MetadataUpdate(uint256 snapId);
  event TokenLocked(uint256 indexed snapId, address indexed approvedContract);

  // errors
  error SnapMustExist(uint256 id);
  error SnapVersionMustExist(uint256 id, string version);
  error SnapVersionMustNotExist(uint256 snapId, string version);
  error MsgSenderMustBeSnapOwner(address msgSender, address snapOwner);
  error InvalidStatusRange(Status status);
  error FieldMustBeFilled(string field);
  error UnauthorizedTransferedAddress(address from, address to, uint256 batchSize);
  
  constructor (string memory name, string memory symbol) ERC721(name, symbol) {
    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

  /// Record a new snap in the registry
  /// @notice Snap record is the basis for releasing new snap versions. `msg.sender` become automatically the snap's owner.
  /// @param name Name of the snap
  /// @param description Description of the snap
  /// @param author Author of the snap
  /// @param category Catogary identifier of the snap
  /// @param docUrl Snap documentation for end-users
  /// @return id Identifier assigned to the new snap
  function addSnap(string memory name, string memory description, string memory author, uint256 category, string memory docUrl) external returns (uint256 id) {
    if (bytes(name).length == 0) revert FieldMustBeFilled(name);
    if (bytes(description).length == 0) revert FieldMustBeFilled(description);

    snapsIndex.increment();
    uint256 snapId = snapsIndex.current();

    _safeMint(msg.sender, snapId);
    
    Snap storage newSnap = snaps[snapId];
    newSnap.name = name;
    newSnap.description = description;
    newSnap.author = author;
    newSnap.category = category;
    newSnap.docUrl = docUrl;

    emit SnapCreated(snapId, msg.sender, name, description, author, category, docUrl);
    emit TokenLocked(snapId, address(this));

    return snapId;
  }

  /// Release a new snap version in the registry
  /// @notice Snap version record is added by the owner of an existing snap for each new version.
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param version Semantic versioning of the snap (SemVerVersion)
  /// @param location Location of the snap code base
  /// @param checksum SHA-256 sum of the snap code
  /// @param signature Signature of the `snapId` by the snap owner
  /// @param changeLog Description of the new released snap version
  function addSnapVersion(uint256 snapId, string memory version, string memory location, string memory checksum, string memory signature, string memory changeLog) external {
    if (msg.sender != ownerOf(snapId)) revert MsgSenderMustBeSnapOwner(msg.sender, ownerOf(snapId));
    if (isSnapVersionReleased(snapId, version)) revert SnapVersionMustNotExist(snapId, version);
    if (bytes(version).length == 0) revert FieldMustBeFilled(version);
    if (bytes(location).length == 0) revert FieldMustBeFilled(location);
    if (bytes(checksum).length == 0) revert FieldMustBeFilled(checksum);
    if (bytes(signature).length == 0) revert FieldMustBeFilled(signature);
    if (bytes(changeLog).length == 0) revert FieldMustBeFilled(changeLog);

    Snap storage snap = snaps[snapId];
    snap.recordedVersions.push(version);
    snap.releasedVersions[version] = true;

    Version storage newVersion = snap.versions[version];
    newVersion.status = Status.LIVE;
    newVersion.location = location;
    newVersion.checksum = checksum;
    newVersion.signature = signature;
    newVersion.changeLog = changeLog;

    emit SnapVersionReleased(snapId, version, location, version, location, checksum, signature, changeLog);
  }

  /// Verification that a specific snap version has been created
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param version Semantic versioning of the snap (SemVerVersion)
  /// @return isCreated Either the snap has been created or not
  function isSnapVersionReleased(uint256 snapId, string memory version) public view returns (bool isCreated) {
    if (!_exists(snapId)) revert SnapMustExist(snapId);

    return (snaps[snapId].releasedVersions[version]);
  }

  /// Retrieve all the information relative to a snap
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @return recordedVersions Snap version released
  function getSnapReleasedVersions(uint256 snapId) external view returns (string[] memory recordedVersions) {
    if (!_exists(snapId)) revert SnapMustExist(snapId);
    return snaps[snapId].recordedVersions;
  }  

  /// Retrieve all the information relative to a snap version
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param version Semantic versioning of the snap (SemVerVersion)
  /// @return snapVersion Snap version information (location, checksum, signature, changeLog, status, statusReason)
  function getSnapVersion(uint256 snapId, string memory version) external view returns (Version memory snapVersion) {
    if (!_exists(snapId)) revert SnapMustExist(snapId);
    return snaps[snapId].versions[version];
  }

  /// Retrieve the status of a snap version
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param version Semantic versioning of the snap (SemVerVersion)
  /// @return status Current status of the snap
  function getSnapVersionStatus(uint256 snapId, string memory version) external view returns (Status status) {
    if (!_exists(snapId)) revert SnapMustExist(snapId);
    return snaps[snapId].versions[version].status;
  }

  /**
    * @dev See {IERC721Metadata-tokenURI}.
    */
  function tokenURI(uint256 snapId) public view virtual override returns (string memory) {
    _requireMinted(snapId);
    return string(
      abi.encodePacked('data:application/json;base64,', 
      Base64.encode(bytes(string(abi.encodePacked(
        '{"name":"', snaps[snapId].name,
        '","description":"', snaps[snapId].description,
        '","external_url":"', snaps[snapId].docUrl,
        '","attributes":[{"trait_type":"Author","value":"', snaps[snapId].author, '"},{"trait_type":"Status","value":"', Strings.toString(snaps[snapId].category), '"}]}'))))));
  }

  /// Update the metadata of a snap
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param name Name of the snap
  /// @param description Description of the snap
  /// @param author Name of the author of the snap
  /// @param docUrl External Url
  function setSnapMetadata(uint256 snapId, string memory name, string memory description, string memory author, uint256 category, string memory docUrl) external {
    if (msg.sender != ownerOf(snapId)) revert MsgSenderMustBeSnapOwner(msg.sender, ownerOf(snapId));

    if (bytes(name).length != 0) snaps[snapId].name = name;
    if (bytes(description).length != 0) snaps[snapId].description = description;
    if (bytes(author).length != 0) snaps[snapId].author = author;
    if (category != 0) snaps[snapId].category = category;
    if (bytes(docUrl).length != 0) snaps[snapId].docUrl = docUrl;

    emit MetadataUpdate(snapId);
  }

  function setSnapStatus(uint256 snapId, string memory version, Status status, string memory reason) external {
    if (msg.sender != ownerOf(snapId)) revert MsgSenderMustBeSnapOwner(msg.sender, ownerOf(snapId));
    if (!isSnapVersionReleased(snapId, version)) revert SnapVersionMustExist(snapId, version);
    if (status > Status.DEPRECATED) revert InvalidStatusRange(status);
    if (bytes(reason).length == 0) revert FieldMustBeFilled(reason);

    snaps[snapId].versions[version].status = status;
    snaps[snapId].versions[version].statusReason = reason;

    emit SnapStatusChanged(snapId, version, status, reason);
  }

  /// Attest a snap version
  /// @notice Attestation by the contract owner
  /// @param snapId Identifier of the snap
  function attestSnapVersion(uint256 snapId, string memory version) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (!_exists(snapId)) revert SnapMustExist(snapId);
    if (!isSnapVersionReleased(snapId, version)) revert SnapVersionMustExist(snapId, version);
    snaps[snapId].versions[version].isAttested = !snaps[snapId].versions[version].isAttested;
  }  

  /// Authorize the snap transfer to a specific address
  /// @notice Currators authorize the transfer of snap to a specific address (e.g. in cas of compromise address) preventing trading of the snaps token
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param newOwner Address to which the snap can be transfered
  function authorizeSnapTransfer(uint256 snapId, address newOwner) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (!_exists(snapId)) revert SnapMustExist(snapId);
    snaps[snapId].consents[newOwner] = true;
  }

  /// Enforce the transfer only to authorized addresses
  /// @notice Transfer is authorized only when an account is compromised in order to prevent tokens trading
  /// @dev Non-transferability is managed by overriding this ERC721 function called before each transfer. See {IERC721-_beforeTokenTransfer}
  function _beforeTokenTransfer(
      address from,
      address to,
      uint256 id, /* firstTokenId */
      uint256 batchSize
  ) internal virtual override {
    if (from != address(0) && to != address(0) && !snaps[id].consents[to]) revert UnauthorizedTransferedAddress(from, to, batchSize);
    snaps[id].consents[to] = false;
  }  

  /// @dev See {IERC165-supportsInterface}
  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
      return super.supportsInterface(interfaceId);
  }  
}
