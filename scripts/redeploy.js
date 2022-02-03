require("dotenv").config();

const { Contract } = require("ethers");
const hre = require("hardhat");
const utils = require("./utils.js");

const deployment = require("../deployment.json");

async function main() {
    utils.upgrade_proxy("Spaces", deployment.spaces_address);
}

main().then(console.log);
