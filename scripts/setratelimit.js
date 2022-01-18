const { Contract } = require("ethers");
const hre = require("hardhat");
const utils = require("./utils.js");


async function main() {

    let posts_address = "0xe040e91728637CD7BB86cd774f3daDE3a96c0717";
    let spaces_address = "0x067D6a9e583925EF4F43F5E788dEB6574A128f1D";
    let accounts_address = "0x1E41f418e97af96ee37c905e3e01D1e966E3A6C3";
    let rate_control_address = "0x7ee5B933C2cfbAA03aF0289c5c342c98a3a557C6";

    const Contract = await ethers.getContractFactory("RateControl");
    const contract = await Contract.attach(rate_control_address);

    let address = "0x0d26378E0E6552fc236e1a7FD67341444C74ee40";

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