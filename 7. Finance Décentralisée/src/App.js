import React from 'react';
import './App.css';
import {ethers} from 'ethers'
//import stakingContract from './artifacts/contracts/Staking.sol/Staking.json'
import { stakingContract } from './stakingContract'
import daiLogo from './assets/dai.png';
import ethLogo from './assets/eth.png';

const stakingAddress = "0x31A41846235D57A3F75Aa53d01BA14aA8De5052e"
const daiAddress = "0xf0149c56C1ef23B4Ea21BF93A017035471561E7C"
const supportedChainId = 42;

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentAccount: null,
      stakeAmount: 0,
      sendAmount: 0,
      withdrawAmount: 0,
      daiAmount: 0,
      myETHamount: 0,
      myDAIamount: 0,
    };
  }
  componentDidMount() {
    this.checkWalletIsConnected();
    this.getDatas();
    this.getBalance();
  }

  getDatas = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner();
      const contract = new ethers.Contract(stakingAddress, stakingContract.abi, signer)
      try {
        const data = await contract.getStake();
        this.setState({stakeAmount: data});
        const data2 = await contract.getRewards();
        this.setState({daiAmount: data2});
        console.log('Data: ', parseInt(data2._hex, 16))
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  getBalance = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(accounts[0]);
      this.setState({myETHamount: ethers.utils.formatEther(balance)});
      console.log(this.state.balance)
    }
  }

  checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      this.setState({noMetaMask: true});
      return;
    } else {
      this.setState({noMetaMask: false});
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const chainId = await ethereum.request({ method: 'eth_chainId' });
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        this.setState({currentAccount: account});
    } else {
      console.log("No authorized account found");
    }
  }

  connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length !== 0) {
        this.setState({notConnected: false});
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        if(parseInt(chainId, 16) === supportedChainId){
          const account = accounts[0];
          console.log("Found an authorized account: ", account);
          this.setState({currentAccount: account});
          this.getBalance();
          this.setState(
              {reload: true},
              () => this.setState({reload: false})
          )
        }
        else {
          this.setState({wrongChainId: true});
          console.log("Wrong network");
        }
      } else {
        this.setState({notConnected: true});
        console.log("No authorized account found");
      }
    } catch (err) {
      console.log(err)
    }
  }

  connectedWalletButton = () => {
    return (
        <div className='flex flex-wrap items-center text-base'>
          <p id="userWallet" style={{lineHeight: "12px"}} className="text-lg text-gray-600"><span id="userWalletSpan" style={{color: "#66cf8e", fontSize: "16px", fontWeight: "bold"}}>{this.state.currentAccount.slice(0,5)+'...'+this.state.currentAccount.slice(38,42)}</span><br /><span style={{fontSize: "10px"}}>WALLET CONNECTED</span></p>
        </div>
    )
  }

  connectWalletButton = () => {
    return (
        <button onClick={() => this.connectWalletHandler()} id="loginButton" className='bg-gray-900 text-gray-200 py-2 px-3 mx-2 rounded border border-indigo-500 hover:bg-gray-800 hover:text-gray-100'>
          <span id="loginButtonText">Connect Wallet</span>
        </button>
    )
  }

  changeStakeAmount = (event) => {
    this.setState({
      sendAmount: event.target.value,
    });
  };

  changeWithdrawAmount = (event) => {
    this.setState({
      withdrawAmount: event.target.value,
    });
  };

  /*intializeContract = async (init) => {
    // We first initialize ethers by creating a provider using window.ethereum
    // When, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    const contract = new ethers.Contract(
        tokenAddress,
        ArcToken.abi,
        init
    );

    return contract
  }*/

  stake = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner();
      const contract = new ethers.Contract(stakingAddress, stakingContract.abi, signer)
      try {
        const data = await contract.stake({ value: ethers.utils.parseEther(this.state.sendAmount.toString())})
        console.log('data: ', data)
        provider.once(data.hash, (transaction) => {
          window.location.reload(false);
        })
      } catch (error) {
        console.log(error);
      }
    }
  }

  withdraw = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner();
      const contract = new ethers.Contract(stakingAddress, stakingContract.abi, signer)
      try {
        const data = await contract.withdraw(ethers.utils.parseEther(this.state.withdrawAmount.toString()))
        console.log('data: ', data)
        provider.once(data.hash, (transaction) => {
          window.location.reload(false);
        })
      } catch (error) {
        console.log(error);
      }
    }
  }

  claimRewards = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner();
      const contract = new ethers.Contract(stakingAddress, stakingContract.abi, signer)
      try {
        const data = await contract.claimRewards()
        console.log('data: ', data)
        provider.once(data.hash, (transaction) => {
          window.location.reload(false);
        })
      } catch (error) {
        console.log(error);
      }
    }
  }

  render() {
    return (
        <div>
          <header className="text-gray-400 bg-gray-900 body-font">
            <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
              {this.state.currentAccount ? this.connectedWalletButton() : this.connectWalletButton()}
              <nav className="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center">
                <button disabled className='bg-indigo-400 text-gray-900 py-2 px-2 mx-2 rounded border border-indigo-300 font-bold'>{ this.state.myETHamount } ETH</button>
              </nav>
            </div>

          </header>
          <section className="text-gray-400 bg-gray-900 body-font">
            <div className="container px-5 py-4 mx-auto">
              <div className="text-center mb-2">
                <h1 className="sm:text-3xl text-2xl font-medium title-font text-white mb-4">Stake ETH and get Dai rewards</h1>
                <p className="text-base leading-relaxed xl:w-2/4 lg:w-3/4 mx-auto text-gray-400 text-opacity-80">
                  Stake your ETH on our protocol and get daily Dai rewards: 1% per day
                </p>
                <div className="flex mt-6 justify-center">
                  <div className="w-16 h-1 rounded-full bg-indigo-500 inline-flex"></div>
                </div>
              </div>
              <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6">
                <div className="p-4 md:w-1/2 flex flex-col text-center items-center">
                  <div
                      className="w-20 h-20 inline-flex items-center justify-center rounded-full bg-gray-800 text-indigo-400 mb-5 flex-shrink-0">
                    <img className="w-22 h-10" alt="logo" src={ethLogo} />
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-white text-lg title-font font-medium mb-3">{ ethers.utils.formatEther(this.state.stakeAmount) } ETH Staked</h2>
                  </div>
                </div>
                <div className="p-4 md:w-1/2 flex flex-col text-center items-center">
                  <div
                      className="w-20 h-20 inline-flex items-center justify-center rounded-full bg-gray-800 text-indigo-400 mb-5 flex-shrink-0">
                    <img className="w-22 h-10" alt="logo" src={daiLogo} />
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-white text-lg title-font font-medium mb-3">{ ethers.utils.formatEther(this.state.daiAmount) } Dai </h2>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="text-gray-400 bg-gray-900 body-font">
            <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6">
              <div className="p-4 md:w-1/2 flex flex-col text-center items-center">
              <div
                  className="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 sm:px-0 items-end sm:space-x-4 sm:space-y-0 space-y-4">
                <div className="relative sm:mb-0 flex-grow w-full">
                  <label htmlFor="amountToStake" className="leading-7 text-sm text-gray-400">ETH amount to stake</label>
                  <input onChange={this.changeStakeAmount} type="number" min="0" step=".001" id="amountToStake" name="amountToStake"
                         className="w-full bg-gray-800 bg-opacity-40 rounded border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 focus:bg-transparent text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                </div>
                <button onClick={() => this.stake()} id="stakeButton" className='bg-gray-900 text-gray-200 py-2 px-3 mx-2 rounded border border-indigo-500 hover:bg-gray-800 hover:text-gray-100'>
                  <span id="stakeButtonText">Stake</span>
                </button>
              </div>
              <div
                  className="flex lg:w-2/3 w-full sm:flex-row flex-col mx-auto px-8 sm:px-0 items-end sm:space-x-4 sm:space-y-0 space-y-4">
                <div className="relative sm:mb-0 flex-grow w-full">
                  <label htmlFor="withdrawAmount" className="leading-7 text-sm text-gray-400">ETH amount to withdraw</label>
                  <input onChange={this.changeWithdrawAmount} type="number" step=".001" min="0" max={ethers.utils.formatEther(this.state.stakeAmount)} id="withdrawAmount" name="withdrawAmount"
                         className="w-full bg-gray-800 bg-opacity-40 rounded border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 focus:bg-transparent text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                </div>
                <button onClick={() => this.withdraw()} id="stakeButton" className='bg-gray-900 text-gray-200 py-2 px-3 mx-2 rounded border border-indigo-500 hover:bg-gray-800 hover:text-gray-100'>
                  <span id="stakeButtonText">Withdraw</span>
                </button>
              </div>
              </div>
              <div className="p-4 md:w-1/2 flex flex-col text-center items-center">
                <button onClick={() => this.claimRewards()} id="stakeButton" className='bg-gray-900 text-gray-200 py-2 px-3 mx-2 rounded border border-indigo-500 hover:bg-gray-800 hover:text-gray-100'>
                  <span id="stakeButtonText">Claim my Dai rewards</span>
                </button>
              </div>
            </div>
          </section>
        </div>
    );
  }
}

export default App;
