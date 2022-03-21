import React, { Component } from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = {
    workflowStatus: "0",
    web3: null,
    accounts: null,
    contract: null,
    walletAddress: "",
    proposal: "",
    proposalList: [],
    winner: "",
    owner: "",
    whitelisted: false
  };

  componentDidMount = async () => {
    try {

      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      console.log(networkId)
      const deployedNetwork = VotingContract.networks[networkId];
      const instance = new web3.eth.Contract(
        VotingContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runInit);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  changeWalletAddress = (event) => {
    this.setState({
      walletAddress: event.target.value
    });
  }

  changeProposal = (event) => {
    this.setState({
      proposal: event.target.value
    });
  }

  runInit = async () => {
    const { accounts, contract } = this.state;

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.status().call({ from: accounts[0] });
    const response2 = await contract.methods.getProposalList().call({ from: accounts[0] });
    const response3 = await contract.methods.owner().call({ from: accounts[0] });
    const response4 = await contract.methods.checkWhitelist().call({ from: accounts[0] });
    console.log(typeof response4)
    console.log(response4)
    if(response == 5){ await this.getWinner(); }
    // Update state with the result.
    this.setState({ workflowStatus: response });
    this.setState({ proposalList: response2 });
    this.setState({ owner: response3 });
    this.setState({ whitelisted: response4 });
  };

  nextStep = async () => {
    const { accounts, contract } = this.state;
    switch(this.state.workflowStatus) {
      case "0":
        try{
          await contract.methods.startProposalsRegistration().send({ from: accounts[0] });
          window.location.reload(false);
        } catch (error) {
          // Catch any errors for any of the above operations.
          alert(
            error,
          );
          console.error(error);
        }
      break;
      case "1":
        try{
          await contract.methods.stopProposalsRegistration().send({ from: accounts[0] });
          window.location.reload(false);
        } catch (error) {
          // Catch any errors for any of the above operations.
          alert(
            error,
          );
          console.error(error);
        }
      break;
      case "2":
        try{
          await contract.methods.startVotingSession().send({ from: accounts[0] });
          window.location.reload(false);
        } catch (error) {
          // Catch any errors for any of the above operations.
          alert(
            error,
          );
          console.error(error);
        }
      break;
      case "3":
        try{
          await contract.methods.stopVotingSession().send({ from: accounts[0] });
          window.location.reload(false);
        } catch (error) {
          // Catch any errors for any of the above operations.
          alert(
            error,
          );
          console.error(error);
        }
      break;
      case "4":
        try{
          await contract.methods.votesTallied().send({ from: accounts[0] });
          window.location.reload(false);
        } catch (error) {
          // Catch any errors for any of the above operations.
          alert(
            error,
          );
          console.error(error);
        }
      break;
  }
  };

  whitelistVoter = async () => {
    const { accounts, contract } = this.state;
    try{
      await contract.methods.whitelistVoter(this.state.walletAddress).send({ from: accounts[0] });
      window.location.reload(false);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        error,
      );
      console.error(error);
    }
  };

  proposal = async () => {
    const { web3, accounts, contract } = this.state;
    try{
      let data = await contract.methods.proposal(this.state.proposal).send({ from: accounts[0] });
      window.location.reload(false);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        error,
      );
      console.error(error);
    }
  };

  vote = async (id) => {
    const { accounts, contract } = this.state;
    try{
      await contract.methods.vote(id).send({ from: accounts[0] });
      window.location.reload(false);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
          error,
      );
      console.error(error);
    }
  };

  AdminFunctions = () => {
    if(this.state.accounts[0] == this.state.owner){
      return (
        <div>
          <h1>ADMIN :</h1>
          <button type="button" onClick={() => this.nextStep()}>Next Step</button>
        </div>
      )
    }
  }

  getWinner = async () => {
    const { accounts, contract } = this.state;
    try{
      const winnerIs = await contract.methods.getWinner().call();
      this.setState({ winner: winnerIs });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
          error,
      );
      console.error(error);
    }
  }

  renderProposalList = (proposal, index) => {
      return (
          <tr>
            <td>{index}</td>
            <td>{proposal.description}</td>
          </tr>
      )
  }

  renderProposalListForVote = (proposal, index) => {
    return (
        <tr>
          <td>{index}</td>
          <td>{proposal.description}</td>
          <td>{proposal.voteCount}</td>
          <td><button type="button" onClick={() => this.vote(index)}>Vote for this proposal</button></td>
        </tr>
    )
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    switch(this.state.workflowStatus) {
      case "0":
        if(this.state.accounts[0] == this.state.owner){
          return (
              <div className="App">
                <h1>Step 1 : Whitelist the voters</h1>
                <label htmlFor="walletAddress">Wallet address : </label>
                <input type="text" id="walletAddress" name="walletAddress" onChange={this.changeWalletAddress} /><br />
                <button type="button" onClick={() => this.whitelistVoter()}>Whitelist</button>
                { this.AdminFunctions() }
              </div>
          );
        }else {
          return (
              <div className="App">
                <h1>Step 1 : Whitelist the voters</h1>
                <p style={{color:"red"}}>You are not the Owner</p>
              </div>
          );
        }
      case "1":
        if(this.state.whitelisted){
          return (
              <div className="App">
                <h1>Step 2 : Proposals Registration</h1>
                <label htmlFor="proposal">Your proposal : </label>
                <input type="text" id="proposal" name="proposal" onChange={this.changeProposal} /><br />
                <button type="button" onClick={() => this.proposal()}>Send proposal</button><br/>
                <h3>All the proposals</h3>
                <table style={{marginLeft: "auto", marginRight: "auto"}}>
                  <tr>
                    <th>ID</th>
                    <th>Proposal</th>
                  </tr>
                  {this.state.proposalList.map((item, index) => ( this.renderProposalList(item, index) ))}
                </table>
                { this.AdminFunctions() }
              </div>
          );
        } else {
          return (
              <div className="App">
                <h1>Step 2 : Proposals Registration</h1>
                <p style={{color:"red"}}>You are note whitelisted</p>
                <h3>All the proposals</h3>
                <table style={{marginLeft: "auto", marginRight: "auto"}}>
                  <tr>
                    <th>ID</th>
                    <th>Proposal</th>
                  </tr>
                  {this.state.proposalList.map((item, index) => ( this.renderProposalList(item, index) ))}
                </table>
                { this.AdminFunctions() }
              </div>
          );
        }

        case "2":
        return (
          <div className="App">
            <h1>Step 3 : Proposals Registration Ended, Vote will start soon</h1>
            { this.AdminFunctions() }
          </div>
        );
        case "3":
          if(this.state.whitelisted){
            return (
                <div className="App">
                  <h1>Step 4 : Vote for your favorite proposal</h1>
                  <table style={{marginLeft: "auto", marginRight: "auto"}}>
                    <tr>
                      <th>ID</th>
                      <th>Proposal</th>
                      <th>Votes</th>
                      <th></th>
                    </tr>
                    {this.state.proposalList.map((item, index) => ( this.renderProposalListForVote(item, index) ))}
                  </table>
                  { this.AdminFunctions() }
                </div>
            );
          }else {
            return (
                <div className="App">
                  <h1>Step 4 : Vote for your favorite proposal</h1>
                  <p style={{color:"red"}}>You are note whitelisted</p>
                  <table style={{marginLeft: "auto", marginRight: "auto"}}>
                    <tr>
                      <th>ID</th>
                      <th>Proposal</th>
                    </tr>
                    {this.state.proposalList.map((item, index) => ( this.renderProposalList(item, index) ))}
                  </table>
                  { this.AdminFunctions() }
                </div>
            );
          }

      case "4":
        return (
          <div className="App">
            <h1>Step 5 : Wait for vote tallying </h1>
            { this.AdminFunctions() }
          </div>
        );
      case "5":
        return (
          <div className="App">
            <h1>Step 6 : The winner is <span style={{color: "green"}}>{this.state.winner}</span></h1>
          </div>
        );
    }
  }
}

export default App;
