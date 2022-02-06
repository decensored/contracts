require("dotenv").config();

const { Contract } = require("ethers");
const hre = require("hardhat");
const utils = require("./utils.js");
const { sha256 } = require("ethers/lib/utils");

async function main(contracts_address) {
    const Contracts = await ethers.getContractFactory("Contracts");
    const contracts = await Contracts.attach(contracts_address);

    let contract_addresses = {};
    contract_addresses['posts'] = await contracts.posts();
    contract_addresses['tokens'] = await contracts.tokens();
    contract_addresses['accounts'] = await contracts.accounts();
    contract_addresses['rate_control'] = await contracts.rate_control();
    contract_addresses['spaces'] = await contracts.spaces();
    return contract_addresses;
}

main("0x3eb8De6C1D7d920fc72f0745475Ecf37a0cF3BF3").then(console.log);
