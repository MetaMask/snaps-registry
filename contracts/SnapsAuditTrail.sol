// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import '@openzeppelin/contracts/utils/Context.sol';

interface ISnapsRegistry {
  function isSnapVersionCreated (uint256 snapId, string memory version) external view returns (bool);
}

contract SnapsAuditTrail is Context, AccessControl {

  ISnapsRegistry snapsRegistry;

  struct Audit {
    address issuer;
    Result result;
    string reason;
    string uri;
    bool isCreated;
  }

  struct Snap {
    mapping(string => Version) versions;
  }

  struct Version {
    mapping(address => Audit) audits;
  }
  
  enum Result { SECURED, UNSECURED, MALICIOUS }

  mapping(uint256 => Snap) snaps;

  // events
  event AuditSubmitted(uint256 indexed snapId, string indexed version, Result indexed result, string reason, string uri);
  event AuditUpdated(uint256 indexed snapId, string indexed version, Result indexed result, string reason, string uri);

  // errors
  error NonExistingSnapVersion(uint256 id, string version);
  error NonExistingAudit(uint256 id, string version, address issuer);

  constructor (address snapsRegistryAddress) {
    snapsRegistry = ISnapsRegistry(snapsRegistryAddress);
  }

  function submitAudit(uint256 snapId, string memory version, Result result, string memory reason, string memory uri) external {
    if(!snapsRegistry.isSnapVersionCreated(snapId, version)) revert NonExistingSnapVersion(snapId, version);
    snaps[snapId].versions[version].audits[msg.sender].result = result;
    snaps[snapId].versions[version].audits[msg.sender].reason = reason;
    snaps[snapId].versions[version].audits[msg.sender].uri = uri;
    snaps[snapId].versions[version].audits[msg.sender].isCreated = true;

    emit AuditSubmitted(snapId, version, result, reason, uri);
  }

  function updateAudit(uint256 snapId, string memory version, Result result, string memory reason, string memory uri) external {
    if(!isAuditCreated(snapId, version)) revert NonExistingAudit(snapId, version, msg.sender);

    snaps[snapId].versions[version].audits[msg.sender].result = result;

    if (bytes(reason).length != 0) {
      snaps[snapId].versions[version].audits[msg.sender].reason = reason;
    }
    if (bytes(uri).length != 0) {
      snaps[snapId].versions[version].audits[msg.sender].uri = uri;
    }

    emit AuditUpdated(snapId, version, result, reason, uri);
  }

  function getAudits(uint256 snapId, string memory version) external view returns (Audit memory audits  ){
    return snaps[snapId].versions[version].audits[msg.sender];
  }

  function getAudit(uint256 snapId, string memory version, address auditor) external view returns (Audit memory audits  ){
    return snaps[snapId].versions[version].audits[auditor];
  }

  function isAuditCreated(uint256 snapId, string memory version) public view returns (bool) {
    return snaps[snapId].versions[version].audits[msg.sender].isCreated;
  }
}