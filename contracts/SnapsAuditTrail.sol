// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./libs/Base64.sol";

/**
 * @title  Snaps Audit Trail
 * @notice Snaps Audit Trail is a contract that keeps track of snaps audits
 */
contract SnapsAuditTrail is ERC721, AccessControl {

  /// Snap Audit counter
  using Counters for Counters.Counter;
  Counters.Counter public auditsIndex;

  /// Snap Audit data structure
  /// @param checksum SHA-256 sum of the snap code
  /// @param risk Result of the audit as a snap security risk level 
  /// @param reason Reason of the audit result
  /// @param reportURI URI of the audit report compliant with the Snaps Audit JSON format
  /// @param isAttested Attestation of the audit by Snaps Platform
  struct Audit {
    string checksum;
    Risk risk;
    string reason;
    string reportURI;
    mapping(address => bool) transferApprovals;
    bool isAttested;
  }

  // struct Attestation {
  //   uint256 auditId;
  //   bool isAttested;
  //   string reason;
  //   string reportURI;
  // }

  /// Snap Audit results
  enum Risk { SEVERE, MAJOR, MINOR, SAFE }

  /// Snaps Audits state
  mapping(uint256 => Audit) public audits;
  // mapping(uint256 => Attestation) public attestations;

  // events
  event AuditSubmitted(string indexed checksumHash, address indexed auditor, uint256 indexed auditId, string checksum, Risk risk, string reason, string reportURI);
  event AuditAttested(string indexed checksumHash, address indexed auditor, uint256 indexed auditId, bool isAttested);
  event AuditUpdated(string indexed checksumHash, address indexed auditor, uint256 indexed auditId, string reason, string reportURI);
  event TokenLocked(uint256 indexed auditId, address indexed approvedContract);
  event MetadataUpdate(uint256 auditId);
  // errors
  error AuditMustExist(uint256 id);
  error SnapVersionMustExist(uint256 id, string version);
  error MsgSenderMustBeAuditOwner(address snapOwner, address msgSender);
  error UnauthorizedTransferedAddress(address from, address to, uint256 batchSize);
  
  /// Snaps Audit Trail is initialized with admins for Snaps audit attestation 
  /// @param name Name of the audit trail registry
  /// @param symbol Symbol of the audit trail registry
  constructor (string memory name, string memory symbol) ERC721(name, symbol) {
    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }


  /// Submit a new snap audit in the audit trail
  /// @param checksum SHA-256 sum of the snap code
  /// @param risk Result of the audit as a snap security risk level 
  /// @param reason Reason of the audit result
  /// @param reportURI URI of the audit report compliant with the Snaps Audit JSON format
  function addAudit(string memory checksum, Risk risk, string memory reason, string memory reportURI) external returns (uint256 id) {
    auditsIndex.increment();
    uint256 auditId = auditsIndex.current();

    _safeMint(msg.sender, auditId);

    Audit storage newAudit = audits[auditId];
    newAudit.checksum = checksum;
    newAudit.risk = risk;
    newAudit.reason = reason;
    newAudit.reportURI = reportURI;

    emit AuditSubmitted(checksum, msg.sender, auditId, checksum, risk, reason, reportURI);
    emit TokenLocked(auditId, address(this));

    return auditId;
  }

  /**
    * @dev See {IERC721Metadata-tokenURI}.
    */
  function tokenURI(uint256 auditId) public view virtual override returns (string memory) {
    _requireMinted(auditId);

    return string(
      abi.encodePacked('data:application/json;base64,', 
      Base64.encode(bytes(string(abi.encodePacked(
        '{"name":"Snap Audit #', Strings.toString(auditId),
        '","description":"Audit of the snap version identified with the checksum: ', audits[auditId].checksum,
        '","external_url":"', audits[auditId].reportURI,
        '","attributes":[{"trait_type":"Risk","value":"', audits[auditId].risk,'"},{"trait_type":"Attested","value":"TODO"},{"trait_type":"Reason","value":"', audits[auditId].reason, '"}]}'))))));
  }

  /// Update Audit metadata
  /// @param auditId Identifier of the audit
  /// @param reason Reason of the audit result
  /// @param reportURI URI of the audit report compliant with the Snaps Audit JSON format
  function setAuditMetadata(uint256 auditId, string memory reason, string memory reportURI) external {
    if (msg.sender != ownerOf(auditId)) revert MsgSenderMustBeAuditOwner(msg.sender, ownerOf(auditId));

    if (bytes(reason).length != 0) audits[auditId].reason = reason;
    if (bytes(reportURI).length != 0) audits[auditId].reportURI = reportURI;

    emit AuditUpdated(audits[auditId].checksum, ownerOf(auditId), auditId, reason, reportURI);
    emit MetadataUpdate(auditId);
  }

  /// Attestation of an audit by MetaMask
  /// @notice only contract admins are able
  /// @param auditId Identifier of the audit
  function setAuditAttestation(uint256 auditId) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (!_exists(auditId)) revert AuditMustExist(auditId);
    audits[auditId].isAttested = !audits[auditId].isAttested;
  }

  /// Authorize the snap transfer to a specific address
  /// @notice Currators authorize the transfer of snap to a specific address (e.g. in cas of compromise address) preventing trading of the snaps token
  /// @param auditId Identifier of the snap assigned at snap creation time
  function authorizeAuditTransfer(uint256 auditId, address newOwner) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (!_exists(auditId)) revert AuditMustExist(auditId);
    audits[auditId].transferApprovals[newOwner] = true;
  }

  /// Enable the transfer only to authorized addresses
  /// @notice Transfer is authorized only when an account is compromised in order to prevent tokens trading
  /// @dev Non-transferability is managed by overriding this ERC721 function called before each transfer. See {IERC721-_beforeTokenTransfer}
  function _beforeTokenTransfer(
      address from,
      address to,
      uint256 id, /* firstTokenId */
      uint256 batchSize
  ) internal virtual override {
    if (from != address(0) && to != address(0) && !audits[id].transferApprovals[to]) revert UnauthorizedTransferedAddress(from, to, batchSize);
    audits[id].transferApprovals[to] = false;
  }  

  /// @dev See {IERC165-supportsInterface}
  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
      return super.supportsInterface(interfaceId);
  }  
}
