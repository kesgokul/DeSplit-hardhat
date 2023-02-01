/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("@nomiclabs/hardhat-waffle");
require("ethereum-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-network-helpers");
require("dotenv").config();

const GOERLI_PKEY = process.env.GOERLI_PKEY;
const GOERLI_PKEY1 = process.env.GOERLI_PKEY1;
const GOERLI_PKEY2 = process.env.GOERLI_PKEY2;

module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    goerli: {
      url: process.env.GOERLI_RPC,
      accounts: [GOERLI_PKEY, GOERLI_PKEY1, GOERLI_PKEY2],
      chainId: 5,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user1: {
      default: 1,
    },
    user2: {
      default: 2,
    },
    user3: {
      default: 3,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
  mocha: {
    timeout: 300000,
  },
};
