// voting.test.js 
const { BN, ether } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Voting = artifacts.require('Voting');
contract('Voting', function (accounts) {
const owner = accounts[0];
 
 beforeEach(async function () {
  this.VotingInstance = await Voting.new({from: owner});
 });
 
it('startProposalsRegistration', async function () {
  expect(await this.Voting.name()).to.equal(_name);
});
});