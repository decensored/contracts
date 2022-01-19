const { Contract } = require("ethers");
const hre = require("hardhat");
const utils = require("./utils.js");


async function main() {

    let posts_address = "0x58A04cA5F631846e764dBfbDa26A421DC213318C";
    let spaces_address = "0xe193F436C450669af5f6A5F6079218f1673Bbbbd";
    let accounts_address = "0x6DCaB77ddA1b5597360e238942E5bd8958b3Dd7B";
    let rate_control_address = "0xDcFD1087B3c550EdCa92D4152b91d05dfb7b0Fc1";

    const Contract = await ethers.getContractFactory("RateControl");
    const contract = await Contract.attach(rate_control_address);

    //let address = "0x0d26378E0E6552fc236e1a7FD67341444C74ee40";
    //return await contract.is_below_rate_limit(address);
    //return await contract.set_rate_limit(address, 50);
    return await contract.set_rate_control_enabled(false);
}

async function get_addreses() {

    let posts_address = "0xe040e91728637CD7BB86cd774f3daDE3a96c0717";
    const Contract = await ethers.getContractFactory("Posts");
    const contract = await Contract.attach(posts_address);

    console.log("Spaces: " + await contract.spaces());
    console.log("Accounts: " + await contract.accounts());
    console.log("RateControl: " + await contract.rate_control());
}

main().then(console.log);