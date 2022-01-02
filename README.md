# Decensored Smart Contract Base

## Install

```
git clone https://github.com/mikrohash/decensored-contracts
cd decensored-contracts
npm install
```

Optionally, run unit tests to check that everything is working:

```
npx hardhat test
```

## Deployment

To deploy the smart contract on Polygon, you need MATIC tokens.
Put the private key of the account with which you want to pay the transaction fees into the `private_key` file. Then run:

```
npx run scripts/deploy.js
```