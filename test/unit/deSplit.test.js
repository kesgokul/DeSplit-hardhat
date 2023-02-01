const { ethers, network, deployments, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");
const AMOUNT = ethers.utils.parseEther("0.3");
const split1 = ethers.utils.parseEther("0.1");
const split2 = ethers.utils.parseEther("0.1");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Desplit unit tests", () => {
      let deSplit, deployer, user1, user2, user3;
      beforeEach(async () => {
        await deployments.fixture(["all"]);
        const accounts = await getNamedAccounts();
        ({ deployer, user1, user2, user3 } = accounts);
        deSplit = await ethers.getContract("DeSplit", deployer);
      });
      describe("pay and create expense", () => {
        let signers, deSplitContract;
        beforeEach(async () => {
          signers = await ethers.getSigners();
          deSplitContract = await deSplit.connect(signers[0]);
        });
        it("should revert if no balance", async () => {
          await expect(
            deSplitContract.payAndCreateExpense(
              AMOUNT,
              user1,
              "Unit test",
              [user1, user2],
              [split1, split2]
            )
          ).to.be.revertedWith("Insufficient_Balance");
        });

        it("should revert if to address is zero address", async () => {
          const deposit = await deSplitContract.deposit({
            value: ethers.utils.parseEther("1"),
          });
          await deposit.wait(1);

          const zeroAddress = ethers.constants.AddressZero;

          await expect(
            deSplitContract.payAndCreateExpense(
              AMOUNT,
              zeroAddress,
              "uint test",
              [user1, user2],
              [split1, split2]
            )
          ).to.be.revertedWith("Address_Zero");
        });

        it("should update the data structures and emit event", async () => {
          const deposit = await deSplitContract.deposit({
            value: ethers.utils.parseEther("1"),
          });
          await deposit.wait(1);

          const balanceBefore = await ethers.provider.getBalance(user1);
          console.log(
            `User balance before pay: ${ethers.utils.formatEther(
              balanceBefore
            )}`
          );

          const pay = await deSplitContract.payAndCreateExpense(
            AMOUNT,
            user1,
            "unit test",
            [user2, user3],
            [split1, split2]
          );
          const payReceipt = await pay.wait(1);

          // check the balance of the receiver address
          const balanceAfter = await ethers.provider.getBalance(user1);
          console.log(
            `User balance after pay: ${ethers.utils.formatEther(balanceAfter)}`
          );

          console.log(payReceipt.events[0].args[0]);
          assert.equal(payReceipt.events[0].args[0], deployer);
          assert.equal(payReceipt.events[0].args[1], user1);
          assert.equal(
            ethers.utils.formatEther(payReceipt.events[0].args[3][0]),
            "0.1"
          );
        });
      });

      describe("getter function", () => {
        let signers, signer1, signer2, deSplitContract, expenseIndex;
        beforeEach(async () => {
          signers = await ethers.getSigners();
          signer1 = signers[1];
          signer2 = signers[2];
          deSplitContract = await deSplit.connect(signers[0]);

          await deSplitContract.deposit({
            value: ethers.utils.parseEther("1"),
          });

          const pay = await deSplitContract.payAndCreateExpense(
            AMOUNT,
            user1,
            "unit test",
            [user2, user3],
            [split1, split2]
          );
          const payReceipt = await pay.wait(1);

          expenseIndex = payReceipt.events[0].args[4].toString();
        });
        it("should get the expense", async () => {
          const expense = await deSplitContract.getExpense(expenseIndex);
          console.log(expense);
          assert.equal(expense[0], deployer);
        });

        it("should revert if expense index is out of bounds", async () => {
          await expect(
            deSplitContract.getExpense(expenseIndex + 1)
          ).to.be.revertedWith("Expense_Out_of_Bounds");
        });
      });

      describe("settle expense", () => {
        let signers, signer1, signer2, deSplitContract, expenseIndex;
        beforeEach(async () => {
          signers = await ethers.getSigners();
          signer1 = signers[1];
          signer2 = signers[2];
          deSplitContract = await deSplit.connect(signers[0]);

          await deSplitContract.deposit({
            value: ethers.utils.parseEther("1"),
          });

          const pay = await deSplitContract.payAndCreateExpense(
            AMOUNT,
            user1,
            "unit test",
            [user2, user3],
            [split1, split2]
          );
          const payReceipt = await pay.wait(1);

          expenseIndex = payReceipt.events[0].args[4].toString();
        });
        it("should revert if caller not a part of the split", async () => {
          const user1Contract = await deSplit.connect(signer1);
          await expect(
            user1Contract.settleExpense(deployer, expenseIndex)
          ).to.be.revertedWith("CallerNotPartOfExpense");
        });

        it("should revert if insufficient balance in user account", async () => {
          const user2Contract = await deSplit.connect(signer2);

          await expect(
            user2Contract.settleExpense(deployer, expenseIndex)
          ).to.be.revertedWith("Insufficient_Balance");
        });

        it("should settle the expense and emit event", async () => {
          const user2Contract = await deSplit.connect(signer2);

          await user2Contract.deposit({
            value: ethers.utils.parseEther("0.2"),
          });

          const settleTx = await user2Contract.settleExpense(
            deployer,
            expenseIndex
          );
          const settleReceipt = await settleTx.wait(1);

          const settleEvent = settleReceipt.events[0].args;

          const expense = await user2Contract.getExpense(expenseIndex);

          assert.equal(settleEvent[0], signer2.address);
          assert.equal(settleEvent[3].toString(), "0");
          assert.equal(expense[3][0].toString(), "0");
        });

        it("should revert if expense already settled", async () => {
          const user2Contract = await deSplit.connect(signer2);

          await user2Contract.deposit({
            value: ethers.utils.parseEther("0.2"),
          });

          const settleTx = await user2Contract.settleExpense(
            deployer,
            expenseIndex
          );
          const settleReceipt = await settleTx.wait(1);

          await expect(
            user2Contract.settleExpense(deployer, expenseIndex)
          ).to.be.revertedWith("Expense_Settled");
        });
      });
    });
