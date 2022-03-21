// voting.test.js 
const { BN } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Voting = artifacts.require('Voting');

contract('Voting', function (accounts) {
  const owner = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];
  
  beforeEach(async function () {
    this.VotingInstance = await Voting.new({from: owner});
  });

  it('Voters Registration Started', async function () {
    expect(await this.VotingInstance.status()).to.be.bignumber.equal(await new BN(Voting.enums.WorkflowStatus.RegisteringVoters));
  });

  it('Whitelist voters', async function () {
    await this.VotingInstance.whitelistVoter(voter1, {from: owner});
    let voter1Data = await this.VotingInstance.whitelist(voter1, {from: owner});
    let voter2Data = await this.VotingInstance.whitelist(voter2, {from: owner});
    expect(voter1Data.isRegistered).to.equal(true);
    expect(voter2Data.isRegistered).to.equal(false);
  });

  it('Proposal Registration Started', async function () {
    await this.VotingInstance.startProposalsRegistration({from: owner});
    expect(await this.VotingInstance.status()).to.be.bignumber.equal(await new BN(Voting.enums.WorkflowStatus.ProposalsRegistrationStarted));
  });

  it('Send a Proposal', async function () {
    let myProposal = "My proposal";
    await this.VotingInstance.whitelistVoter(voter1, {from: owner});
    await this.VotingInstance.startProposalsRegistration({from: owner});
    await this.VotingInstance.proposal(myProposal, {from: voter1});
    let proposalList = await this.VotingInstance.proposalList(0, {from: owner});
    expect(proposalList.description).to.equal(myProposal);
  });

  it('Proposal Registration Stopped', async function () {
    await this.VotingInstance.startProposalsRegistration({from: owner});
    await this.VotingInstance.stopProposalsRegistration({from: owner});
    expect(await this.VotingInstance.status()).to.be.bignumber.equal(await new BN(Voting.enums.WorkflowStatus.ProposalsRegistrationEnded));
  });

  it('Voting Session Started', async function () {
    await this.VotingInstance.startProposalsRegistration({from: owner});
    await this.VotingInstance.stopProposalsRegistration({from: owner});
    await this.VotingInstance.startVotingSession({from: owner});
    expect(await this.VotingInstance.status()).to.be.bignumber.equal(await new BN(Voting.enums.WorkflowStatus.VotingSessionStarted));
  });

  it('Send votes', async function () {
    let myProposal = "My proposal";
    await this.VotingInstance.whitelistVoter(voter1, {from: owner});
    await this.VotingInstance.whitelistVoter(voter2, {from: owner});
    await this.VotingInstance.startProposalsRegistration({from: owner});
    await this.VotingInstance.proposal(myProposal, {from: voter1});
    await this.VotingInstance.stopProposalsRegistration({from: owner});
    await this.VotingInstance.startVotingSession({from: owner});
    await this.VotingInstance.vote(0, {from: voter1});
    await this.VotingInstance.vote(0, {from: voter2});
    let proposalList = await this.VotingInstance.proposalList(0, {from: owner});
    let voter1Data = await this.VotingInstance.whitelist(voter1, {from: owner});
    let voter2Data = await this.VotingInstance.whitelist(voter2, {from: owner});
    expect(proposalList.voteCount).to.be.bignumber.equal(new BN(2));
    expect(voter1Data.hasVoted).to.equal(true);
    expect(voter2Data.hasVoted).to.equal(true);
    expect(voter1Data.votedProposalId).to.be.bignumber.equal(new BN(0));
    expect(voter2Data.votedProposalId).to.be.bignumber.equal(new BN(0));
  });

  it('Voting Session Stopped', async function () {
    await this.VotingInstance.startProposalsRegistration({from: owner});
    await this.VotingInstance.stopProposalsRegistration({from: owner});
    await this.VotingInstance.startVotingSession({from: owner});
    await this.VotingInstance.stopVotingSession({from: owner});
    expect(await this.VotingInstance.status()).to.be.bignumber.equal(await new BN(Voting.enums.WorkflowStatus.VotingSessionEnded));
  });

  it('Votes tailled', async function () {
    await this.VotingInstance.startProposalsRegistration({from: owner});
    await this.VotingInstance.stopProposalsRegistration({from: owner});
    await this.VotingInstance.startVotingSession({from: owner});
    await this.VotingInstance.stopVotingSession({from: owner});
    await this.VotingInstance.votesTallied({from: owner});
    expect(await this.VotingInstance.status()).to.be.bignumber.equal(await new BN(Voting.enums.WorkflowStatus.VotesTallied));
  });
  it('Check the winner', async function () {
    let myProposal = "My proposal";
    let winnerProposal = "Winner proposal";
    await this.VotingInstance.whitelistVoter(voter1, {from: owner});
    await this.VotingInstance.whitelistVoter(voter2, {from: owner});
    await this.VotingInstance.startProposalsRegistration({from: owner});
    await this.VotingInstance.proposal(myProposal, {from: voter1});
    await this.VotingInstance.proposal(winnerProposal, {from: voter2});
    await this.VotingInstance.stopProposalsRegistration({from: owner});
    await this.VotingInstance.startVotingSession({from: owner});
    await this.VotingInstance.vote(1, {from: voter1});
    await this.VotingInstance.vote(1, {from: voter2});
    await this.VotingInstance.stopVotingSession({from: owner});
    await this.VotingInstance.votesTallied({from: owner});

    let winner = await this.VotingInstance.getWinner({from: owner});
    expect(winner).to.equal(winnerProposal);
  });

});