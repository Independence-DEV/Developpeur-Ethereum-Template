// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.12;

import "./Ownable.sol";

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
    mapping(address=> Voter) public whitelist;

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }
    WorkflowStatus public status = WorkflowStatus.RegisteringVoters;

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    function whitelistVoter(address _address) public onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "The registration is not open !");
        require(!whitelist[_address].isRegistered, "This address is already whitelisted !");
        whitelist[_address].isRegistered = true;
        emit VoterRegistered(_address);
    }

    function checkWhitelist() public view returns(bool){
        return whitelist[msg.sender].isRegistered;
    }

    function startProposalsRegistration() public onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "Wrong previous status");
        status = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, status);
    }
    function stopProposalsRegistration() public onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Wrong previous status");
        status = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, status);
    }
    function startVotingSession() public onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationEnded, "Wrong previous status");
        status = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, status);
    }
    function stopVotingSession() public onlyOwner {
        require(status == WorkflowStatus.VotingSessionStarted, "Wrong previous status");
        status = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, status);
    }
    function votesTallied() public onlyOwner {
        require(status == WorkflowStatus.VotingSessionEnded, "Wrong previous status");
        status = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, status);
    }    
    function proposal(string memory _description) public {
        require(whitelist[msg.sender].isRegistered, "This address is not whitelisted !");
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "The proposal session is not open !");
        Proposal memory newProposal;
        newProposal.description = _description;
        newProposal.voteCount = 0;
        proposalList.push(newProposal);
        emit ProposalRegistered(proposalList.length-1);
    }

    function getProposalList() public view returns(Proposal[] memory){
        return proposalList;
    }

    function vote(uint _proposalId) public {
        require(whitelist[msg.sender].isRegistered, "This address is not whitelisted !");
        require(!whitelist[msg.sender].hasVoted, "You already voted !");
        require(status == WorkflowStatus.VotingSessionStarted, "The voting session is not open !");
        require(_proposalId <= (proposalList.length-1), "This proposal doesn't exist !");
        whitelist[msg.sender].hasVoted = true;
        whitelist[msg.sender].votedProposalId = _proposalId;
        proposalList[_proposalId].voteCount++;
        winningProposalId = 0;
        if (proposalList[_proposalId].voteCount > proposalList[winningProposalId].voteCount) {
            winningProposalId = _proposalId;
        }
        emit Voted(msg.sender, _proposalId);
    }

    function getWinner() public view returns(string memory) {
        require(status == WorkflowStatus.VotesTallied, "Voting not finish !");
        return proposalList[winningProposalId].description;
    }
}
