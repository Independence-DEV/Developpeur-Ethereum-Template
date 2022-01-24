// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable{
    uint256 public winningProposalId;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }
    struct Proposal {
        string description;
        uint voteCount;
    }
    Proposal[] public proposalList;
    mapping(address=> Voter) public _whitelist;

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }
    WorkflowStatus public status;

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    constructor() {
        status = WorkflowStatus.RegisteringVoters;
    }

    function whitelist(address _address) public onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "The registration is not open !");
        require(!_whitelist[_address].isRegistered, "This address is already whitelisted !");
        _whitelist[_address].isRegistered = true;
        _whitelist[msg.sender].hasVoted = false;
        emit VoterRegistered(_address);
    }

    function startProposalsRegistration() public onlyOwner {
        WorkflowStatus previousStatus = status;
        status = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(previousStatus, status);
    }
    function stopProposalsRegistration() public onlyOwner {
        WorkflowStatus previousStatus = status;
        status = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(previousStatus, status);
    }
    function startVotingSession() public onlyOwner {
        WorkflowStatus previousStatus = status;
        status = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(previousStatus, status);
    }
    function stopVotingSession() public onlyOwner {
        WorkflowStatus previousStatus = status;
        status = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(previousStatus, status);
    }
    function tallyVotes() public onlyOwner {
        require(proposalList.length > 0, "No proposal for this vote !");
        WorkflowStatus previousStatus = status;
        uint previousVoteCount = 0;
        winningProposalId = 0;
        for (uint i=0; i<proposalList.length; i++) {
        if (proposalList[i].voteCount > previousVoteCount) {
                winningProposalId = i;
            }
        }
        status = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(previousStatus, status);
    }

    function getWinner() public view returns(string memory) {
        require(status == WorkflowStatus.VotesTallied, "Voting not finish !");
        return proposalList[winningProposalId].description;
    }
    
    function proposal(string memory _description) public {
        require(_whitelist[msg.sender].isRegistered, "This address is not whitelisted !");
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "The proposal session is not open !");
        Proposal memory newProposal;
        newProposal.description = _description;
        newProposal.voteCount = 0;
        proposalList.push(newProposal);
        emit ProposalRegistered(proposalList.length-1);
    }

    function vote(uint _proposalId) public {
        require(_whitelist[msg.sender].isRegistered, "This address is not whitelisted !");
        require(!_whitelist[msg.sender].hasVoted, "You already voted !");
        require(status == WorkflowStatus.VotingSessionStarted, "The voting session is not open !");
        require(_proposalId <= (proposalList.length-1), "This proposal doesn't exist !");
        _whitelist[msg.sender].hasVoted = true;
        _whitelist[msg.sender].votedProposalId = _proposalId;
        proposalList[_proposalId].voteCount++;
        emit Voted(msg.sender, _proposalId);
    }
}
