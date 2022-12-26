// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/access/AccessControl.sol';

interface ISnapsRegistry {
  function addValidator(address validator) external;
  function removeValidator(address validator) external;
}

error AlreadyVoted(address);

contract SnapsValidators is AccessControl {

  ISnapsRegistry snapsRegistry;
  address[] public membersRegistry;

  event ValidatorAdded(address);
  event ValidatorRemoved(address);
  event MemberAdded(address);
  event MemberRemoved(address);

  struct Applicant {
    uint256 vote;
    uint256 quorum;
    mapping(address => bool) voters;
    bool isCreated;
  }

  mapping (address => Applicant) public validators;
  mapping (address => Applicant) public members;
  
  constructor (address snapsRegistryAddress, address[] memory members_) {
    snapsRegistry = ISnapsRegistry(snapsRegistryAddress);
    for(uint i = 0; i < members_.length; i++) {
      _grantRole('MEMBER', members_[i]);
    }
    membersRegistry = members_;
  }

  function addMember (address newMember) external onlyRole('MEMBER') {
    if (members[newMember].voters[_msgSender()] == true) revert AlreadyVoted(_msgSender());
    if (!members[newMember].isCreated) members[newMember].quorum = membersRegistry.length;
    members[newMember].vote++;
    members[newMember].voters[_msgSender()] = true;

    if (members[newMember].vote == members[newMember].quorum) {
      _grantRole('MEMBER', newMember);
      emit MemberAdded(newMember);
    }
    _grantRole('MEMBER', newMember);
  }

  function removeMember (address member) external onlyRole('MEMBER') {
    if (members[member].voters[_msgSender()] == false) revert AlreadyVoted(_msgSender());
    members[member].vote--;
    members[member].voters[_msgSender()] = false;

    if (members[member].vote < 1) {
      _revokeRole('MEMBER', member);
      emit MemberRemoved(member);
    }
    
  }

  function removeValidator (address applicant) external onlyRole('MEMBER') {
    if (validators[applicant].voters[_msgSender()] == false) revert AlreadyVoted(_msgSender());
    validators[applicant].vote--;
    validators[applicant].voters[_msgSender()] = false;

    if (validators[applicant].vote < 1) {
      snapsRegistry.removeValidator(applicant);
      emit ValidatorRemoved(applicant);
    }
  }

  function addValidator(address applicant) external onlyRole('MEMBER') {
    if (validators[applicant].voters[_msgSender()] == true) revert AlreadyVoted(_msgSender());
    if (!validators[applicant].isCreated) validators[applicant].quorum = membersRegistry.length;
    validators[applicant].vote++;
    validators[applicant].voters[_msgSender()] = true;

    if (validators[applicant].vote == validators[applicant].quorum) {
      snapsRegistry.addValidator(applicant);
      emit ValidatorAdded(applicant);
    }
  }
  
}