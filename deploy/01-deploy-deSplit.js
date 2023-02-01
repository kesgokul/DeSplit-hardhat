const { ethers, network } = require("hardhat");
const { verify } = require("../utils/verify.js");
const { developmentChains } = require("../helper-hardhat-config.js");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const governanceToken = await deploy("DeSplit", {
    contract: "DeSplit",
    from: deployer,
    blockConfirmations: 1,
    log: true,
  });
  log("-------------------------------------------------------");

  if (!developmentChains.includes(network.name)) {
    console.log("Verifying contract on Etherscan...");
    verify(governanceToken.address);
  }
};
module.exports.tags = ["all", "deSplit"];
