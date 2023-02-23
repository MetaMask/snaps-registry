// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title  SnapRegistry
 * @notice Snap Registry is a contract to help facilitate snap permissionless distribution
 */
contract SnapsRegistryV2 is ERC721URIStorage, AccessControl {

  using Counters for Counters.Counter;
  Counters.Counter public snapsIndex;

  struct Snap {
    string name;
    string lastVersion;
    string[] recordedVersions;
    mapping(string => Version) versions;
    mapping(address => bool) consents;
  }

  struct Version {
    string location;
    string checksum;
    string signature;
    string log;
    Status status;
    string statusReason;
  }

  enum Status { LIVE, PAUSED, DEPRECATED }
  mapping(uint256 => Snap) public snaps;

  // roles
  bytes32 public constant CURRATOR_ROLE = keccak256("CURRATOR_ROLE");

  // events
  event SnapCreated(uint256 indexed snapId, address indexed owner, string indexed name, string uri);
  event SnapReleased(uint256 indexed snapId, string indexed location, string indexed version, string checksum, string signature);

  // errors
  error NonExistingSnapId(uint256 id);
  error NonExistingSnapVersion(uint256 id, string version);
  error OnlySnapOwner(address snapOwner, address msgSender);
  error InvalidSnapVersion(string version);
  error InvalidSnapLocation(string signature);
  error InvalidSnapChecksum(string checksum);
  error InvalidSnapSignature(string signature);
  error InvalidLog(string log);
  error ReasonMustBeSet(uint256 snapId, string version, Status status, string);
  error NameMustBeSet(string name);
  error URIMustBeSet(string uri);
  error ExistingSnapVersion(uint256 snapId, string version);
  error UnauthorizedTransferedAddress(address from, address to, uint256 batchSize);
  
  constructor (string memory name, string memory symbol) ERC721(name, symbol) {
    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

  /// Record a new snap in the registry
  /// @notice Snap record is the basis for releasing new snap versions. `msg.sender` become automatically the snap's owner.
  /// @param name Name of the snap
  /// @param uri Identifier of a standardized resource (ERC721 Metadata JSON Schema) describing snap metadata such as its description, image, author etc.
  /// @return id Identifier assigned to the new snap
  function createSnap(string memory name, string memory uri) external returns (uint256 id) {
    if (bytes(name).length == 0) revert NameMustBeSet(name);
    if (bytes(uri).length == 0) revert URIMustBeSet(uri);

    snapsIndex.increment();
    uint256 snapId = snapsIndex.current();
    Snap storage newSnap = snaps[snapId];

    _safeMint(msg.sender, snapId);
    _setTokenURI(snapId, uri);
    newSnap.name = name;

    emit SnapCreated(snapId, msg.sender, name, uri);

    return snapId;
  }

  /// Release a new snap version in the registry
  /// @notice Snap version record is added by the owner of an existing snap for each new version.
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param version Semantic versioning of the snap (SemVerVersion)
  /// @param location Location of the snap code base
  /// @param checksum SHA-256 sum of the snap code
  /// @param signature Signature of the `snapId` by the snap owner
  /// @param log Description of the new released snap version
  function releaseSnapVersion(uint256 snapId, string memory version, string memory location, string memory checksum, string memory signature, string memory log) external {
    if (msg.sender != ownerOf(snapId)) revert OnlySnapOwner(msg.sender, ownerOf(snapId));
    if (bytes(version).length == 0) revert InvalidSnapVersion(version);
    if (bytes(snaps[snapId].versions[version].location).length != 0) revert ExistingSnapVersion(snapId, version);
    if (bytes(location).length == 0) revert InvalidSnapLocation(location);
    if (bytes(checksum).length == 0) revert InvalidSnapChecksum(checksum);
    if (bytes(signature).length == 0) revert InvalidSnapSignature(signature);
    if (bytes(log).length == 0) revert InvalidLog(log);

    Snap storage snap = snaps[snapId];
    Version storage newVersion = snap.versions[version];

    snap.recordedVersions.push(version);
    snap.lastVersion = version;
    newVersion.status = Status.LIVE;
    newVersion.location = location;
    newVersion.checksum = checksum;
    newVersion.signature = signature;
    newVersion.log = log;

    emit SnapReleased(snapId, version, location, checksum, signature);
  }

  /// Verification that a specific snap version has been created
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param version Semantic versioning of the snap (SemVerVersion)
  /// @return isCreated Either the snap has been created or not
  function isSnapVersionCreated(uint256 snapId, string memory version) public view returns (bool isCreated) {
    return bytes(snaps[snapId].versions[version].location).length > 0;
  }

  /// Retrieve all the information relative to a snap
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @return name Name of the snap
  /// @return owner Owner of the snap
  /// @return uri Identifier of a standardized resource (ERC721 Metadata JSON Schema) describing snap metadata such as its description, image, author etc.
  /// @return lastVersion Last snap version released
  /// @return recordedVersions Snap version released
  function getSnap(uint256 snapId) external view returns (string memory name, address owner, string memory uri, string memory lastVersion, string[] memory recordedVersions) {
    if (!_exists(snapId)) revert NonExistingSnapId(snapId);
    return (snaps[snapId].name, ownerOf(snapId), tokenURI(snapId), snaps[snapId].lastVersion, snaps[snapId].recordedVersions);
  }

  /// Retrieve all the information relative to a snap version
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param version Semantic versioning of the snap (SemVerVersion)
  /// @return name Name of the snap
  /// @return owner Owner of the snap
  /// @return uri Identifier of a standardized resource (ERC721 Metadata JSON Schema) describing snap metadata such as its description, image, author etc.
  /// @return snapVersion Snap version information (location, checksum, signature, log, status, statusReason)
  function getSnapVersion(uint256 snapId, string memory version) external view returns (string memory name, address owner, string memory uri, Version memory snapVersion) {
    if (!_exists(snapId)) revert NonExistingSnapId(snapId);
    return (snaps[snapId].name, ownerOf(snapId), tokenURI(snapId), snaps[snapId].versions[version]);
  }

  /// Retrieve the status of a snap version
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param version Semantic versioning of the snap (SemVerVersion)
  /// @return status Current status of the snap
  function getSnapStatus (uint256 snapId, string memory version) external view returns (Status status) {
    return snaps[snapId].versions[version].status;
  }

  /// Update the metadata of a snap
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param name Name of the snap
  /// @param uri Identifier of a standardized resource (ERC721 Metadata JSON Schema) describing snap metadata such as its description, image, author etc.
  function updateSnapMetadata(uint256 snapId, string memory name, string memory uri) external {
    if (msg.sender != ownerOf(snapId)) revert OnlySnapOwner(msg.sender, ownerOf(snapId));

    if (bytes(name).length != 0) {
      snaps[snapId].name = name;
    }
    if (bytes(uri).length != 0) {
      _setTokenURI(snapId, uri);
    }
  }

  /// Tag snap version as deprecated
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param version Semantic versioning of the snap (SemVerVersion)
  /// @param reason Reason of the deprecation
  function deprecateSnapVersion(uint256 snapId, string memory version, string memory reason) external {
    if (msg.sender != ownerOf(snapId)) revert OnlySnapOwner(msg.sender, ownerOf(snapId));
    if (!isSnapVersionCreated(snapId, version)) revert NonExistingSnapVersion(snapId, version);
    if (bytes(reason).length == 0) revert ReasonMustBeSet(snapId, version, Status.DEPRECATED, reason);

    snaps[snapId].versions[version].status = Status.DEPRECATED;
    snaps[snapId].versions[version].statusReason = reason;
  }

  /// Tag snap version as paused
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param version Semantic versioning of the snap (SemVerVersion)
  /// @param reason Reason of the pause
  function pausedSnapVersion(uint256 snapId, string memory version, string memory reason) external onlyRole('CURATOR_ROLE') {
    if (!_exists(snapId)) revert NonExistingSnapId(snapId);
    if (!isSnapVersionCreated(snapId, version)) revert NonExistingSnapVersion(snapId, version);
    if (bytes(reason).length == 0) revert ReasonMustBeSet(snapId, version, Status.PAUSED, reason);

    snaps[snapId].versions[version].status = Status.PAUSED;
    snaps[snapId].versions[version].statusReason = reason;
  }

  /// Tag snap version as live
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param version Semantic versioning of the snap (SemVerVersion)
  /// @param reason Reason of the go live
  function goLiveSnapVersion(uint256 snapId, string memory version, string memory reason) external onlyRole('CURATOR_ROLE') {
    if (!_exists(snapId)) revert NonExistingSnapId(snapId);
    if (!isSnapVersionCreated(snapId, version)) revert NonExistingSnapVersion(snapId, version);
    if (bytes(reason).length == 0) revert ReasonMustBeSet(snapId, version, Status.PAUSED, reason);

    snaps[snapId].versions[version].status = Status.LIVE;
    snaps[snapId].versions[version].statusReason = reason;
  }

  /// Delete snap version
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param version Semantic versioning of the snap (SemVerVersion)
  function deleteSnapVersion(uint256 snapId, string memory version) external {
    if (msg.sender != ownerOf(snapId)) revert OnlySnapOwner(msg.sender, ownerOf(snapId));
    if (!isSnapVersionCreated(snapId, version)) revert NonExistingSnapVersion(snapId, version);

    delete snaps[snapId].versions[version];
  }

  /// Delete snap
  /// @param snapId Identifier of the snap assigned at snap creation time
  function deleteSnap(uint256 snapId) external {
    if (msg.sender != ownerOf(snapId)) revert OnlySnapOwner(msg.sender, ownerOf(snapId));
    _burn(snapId);
    delete snaps[snapId];
  }

  /// Grant an address to a currator role
  /// @notice Currators authorize the transfer of snap to a specific address (e.g. in cas of compromise address) preventing trading of the snaps token
  /// @param currator Address granted to currator role
  function grantCurrator(address currator) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(CURRATOR_ROLE, currator);
  }


  /// Authorize the snap transfer to a specific address
  /// @notice Currators authorize the transfer of snap to a specific address (e.g. in cas of compromise address) preventing trading of the snaps token
  /// @param snapId Identifier of the snap assigned at snap creation time
  /// @param newOwner Address to which the snap can be transfered
  function authorizeSnapTransfer(uint256 snapId, address newOwner) external onlyRole(DEFAULT_ADMIN_ROLE | CURRATOR_ROLE) {
    if (!_exists(snapId)) revert NonExistingSnapId(snapId);
    snaps[snapId].consents[newOwner] = true;
  }

  /// Enforce the transfer only to authorized addresses
  /// @notice received privileges are nominative
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