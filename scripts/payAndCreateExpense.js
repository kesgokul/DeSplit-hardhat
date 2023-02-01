const { ethers, network, getNamedAccounts } = require("hardhat");

const split1 = ethers.utils.parseEther("0.0025");
const split2 = ethers.utils.parseEther("0.0025");

const payAndCreateExpense = async () => {
  //   console.log(network.name);
  const { deployer, user1, user2 } = await getNamedAccounts();
  const signers = await ethers.getSigners();
  const [signer0, signer1, signer2] = signers;

  const deSplit = await ethers.getContract("DeSplit", deployer);
  const deSplitSigner0 = deSplit.connect(signer0);

  console.log(deSplit.address);

  // 1. Deposit Eth into the contract
  console.log(`Depositing ETH to the contract from ${deployer}`);
  //   const depositTx = await deSplitSigner0.deposit({
  //     value: ethers.utils.parseEther("0.1"),
  //   });
  //   await depositTx.wait(1);
  console.log("Deposit successful");

  // 2. Call the pay function
  console.log(`Paying ${user1} and spliting expense`);
  const payTx = await deSplitSigner0.payAndCreateExpense(
    ethers.utils.parseEther("0.05"),
    user2,
    "Test 1",
    [user1, user2],
    [split1, split2],
    {
      gasLimit: 3000000,
    }
  );

  const payReceipt = await payTx.wait(1);
  console.log("Payment and split successfull");
  console.log(payReceipt.events[0].args);

  //   console.log(signers);
};

payAndCreateExpense()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
