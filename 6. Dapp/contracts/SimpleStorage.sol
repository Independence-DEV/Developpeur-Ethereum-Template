// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <=0.8.12;

contract SimpleStorage {
  uint storedData;

  function set(uint x) public {
    storedData = x;
  }

  function get() public view returns (uint) {
    return storedData;
  }
}
