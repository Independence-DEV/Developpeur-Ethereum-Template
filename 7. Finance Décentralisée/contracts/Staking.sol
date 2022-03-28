//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./AggregatorV3Interface.sol";

contract Staking is Ownable {
    using SafeMath for uint256;
    IERC20 public dai;
    AggregatorV3Interface internal priceETH;

    mapping(address => uint256) private balances;
    mapping(address => uint256) private rewards;
    mapping(address => uint256) private lastUpdate;

    uint256 public dailyInterest;
    uint256 public totalStake;
    uint256 public totalClaimRewards;

    event claimRewardEvent(uint256 amount);
    event stakeEvent(uint256 amount);
    event withdrawEvent(uint256 amount);

    constructor(address _dai) {
        dai = IERC20(_dai);
        priceETH = AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);
        dailyInterest = 1; // 1% per day
    }

    function getLatestETHPrice() public view returns (int256) {
        (,int256 price,,,) = priceETH.latestRoundData();
        return price;
    }

    function stake() external payable {
        rewards[msg.sender] = calculateRewards(msg.sender);
        lastUpdate[msg.sender] = block.timestamp;
        balances[msg.sender] += msg.value;
        totalStake += msg.value;
        emit stakeEvent(msg.value);
    }

    function withdraw(uint256 _amount) external {
        require(_amount <= balances[msg.sender], "Wrong withdraw amount");
        balances[msg.sender] -= _amount;
        totalStake -= _amount;
        payable(msg.sender).transfer(_amount);
        emit withdrawEvent(_amount);
    }

    function getStake() external view returns (uint256) {
        return balances[msg.sender];
    }

    function calculateRewards(address account) internal view returns (uint256) {
        if(balances[msg.sender] == 0) return 0;
        uint256 differenceTimestamp = block.timestamp - lastUpdate[account];
        uint256 daiAmount = (balances[account].mul(uint256(getLatestETHPrice()).div(100000000)));
        return daiAmount.mul(differenceTimestamp).div(86400).mul(dailyInterest).div(100);
    }

    function getRewards() public view returns (uint256) {
        return rewards[msg.sender] + calculateRewards(msg.sender);
    }

    function claimRewards() external {
        uint256 reward = rewards[msg.sender] + calculateRewards(msg.sender);
        totalClaimRewards += reward;
        lastUpdate[msg.sender] = block.timestamp;
        rewards[msg.sender] = 0;
        dai.transfer(msg.sender, reward);
        emit claimRewardEvent(reward);
    }
}