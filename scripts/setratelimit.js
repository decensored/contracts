const { Contract } = require("ethers");
const hre = require("hardhat");
const utils = require("./utils.js");


async function main() {

    let posts_address = "0xa0ADD68e2896C0DC43B29D02CD6CeD3D5f9c6C2E";
    let spaces_address = "0xf54c985830315E274A9Bd4D05398B22dAD10FB1D";
    let accounts_address = "0x6DCaB77ddA1b5597360e238942E5bd8958b3Dd7B";
    let rate_control_address = "0xDcFD1087B3c550EdCa92D4152b91d05dfb7b0Fc1";

    const Contract = await ethers.getContractFactory("RateControl");
    const contract = await Contract.attach(rate_control_address);

    let address = "0x0d26378E0E6552fc236e1a7FD67341444C74ee40";

    //return await contract.is_below_rate_limit(address);
    return await contract.set_rate_limit(address, 50);
/*
    const Contract = await ethers.getContractFactory("Accounts");
    const contract = await Contract.attach(accounts_address);

    return await contract.id_by_address("0xeF2565F3DDccF22c4f59f90D85968648Bf78C3fd");*/
}

main().then(console.log);