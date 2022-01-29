require("dotenv").config();

const { Contract } = require("ethers");
const hre = require("hardhat");
const utils = require("./utils.js");

const deployment = require("../deployment.json");

async function main() {
  const contract_address = "0x5533925D25c208541981A3eeB2FD7C21188Bbfc9";
  const Contract = await ethers.getContractFactory("NFT");
  const contract = await Contract.attach(contract_address);

  const address = "0xCC1588c2b1FF5dDeCC7801fe3ae848c5631b300D";
  const claims = 1;

  await contract.set_claims_for_address(address, claims);
  return "claims set";
}

main().then(console.log);
