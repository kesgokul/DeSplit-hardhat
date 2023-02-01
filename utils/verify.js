const { run } = require("hardhat");

const verify = async function (address, args = []) {
  console.log("verifying contract");
  try {
    await run("verify:verify", {
      contractAddress: address,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.toLowerCase().includes("already verifier")) {
      console.log("Already verified");
    } else {
      console.log(e);
    }
  }
};

module.exports = { verify };
