# Decensored Smart Contract Base

## Install

```
git clone https://github.com/mikrohash/decensored-contracts
cd decensored-contracts
npm install
```

Optionally, run unit tests to check that everything is working:

```
npm test
```

## Deployment

Generate the abi (.json) files

> npm run generate-abis

Copy .env.example to .env and edit .env

> npm run deploy

optionally

> npm run disableratecontrol

or to do it all at once with

> npm run deploy-without-ratecontrol
