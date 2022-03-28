require("@nomiclabs/hardhat-waffle");
let secret = require('./secret');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    kovan: {
      url: "https://kovan.infura.io/v3/6aa294fe6134493dbf0984a84e0dc58d",
      chainId: 42,
      accounts: [secret.test],
    }
  }
};
