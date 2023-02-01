# DeSplit

## A decentralised app for spliting payments with friends

This repo contains the contracts, deploy scripts, tests for the above mentioned app.

## Functions

1. The App allows user to deposit any amount of Ether into the contract; that can be used to make payments.
2. This app Allows a user to make a payment to any address (on behalf of a group) and then split the payment with the group.

It keeps track of,

- The balance Ether deposited into the contract by each user.
- All expenses,
- The group of addresses the expense is split between and the respective split amount.

3.  Allows user to settle an amount owed to the payer of a particular expense that they are a part of
4.  Allows user to withdraw any remaining balance of Ether that is mapped to their address.
