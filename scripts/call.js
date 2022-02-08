require("dotenv").config();

const { Contract } = require("ethers");
const hre = require("hardhat");
const utils = require("./utils.js");
const { sha256 } = require("ethers/lib/utils");
const deployment = require("../deployment.json");

async function main() {
    const Contract = await ethers.getContractFactory("Spaces");
    const contract = await Contract.attach(deployment.spaces_address);
    return contract.owner();
}

main().then(console.log);
