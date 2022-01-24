// voting.test.js 
const { BN, ether } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Voting = artifacts.require('Voting');

contract('Voting', function (accounts) {
const owner = accounts[0];
 
 beforeEach(async function () {
  this.VotingInstance = await Voting.new({from: owner});
 });
 
  it('Proposals Registration Started', async function () {
    expect(await this.VotingInstance.status()).to.equal(VotingInstance.enums.WorkflowStatus.RegisteringVoters);
  });
});