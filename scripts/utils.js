const { expect, assert } = require("chai");
const { ethers, waffle } = require("hardhat");

const FEE = "90000000000000000";
const provider = waffle.provider;

async function deploy_contract(name) {
    const Contract = await ethers.getContractFactory(name);
    const contract = await Contract.deploy();
    await contract.deployed();
    return contract;
}

async function deploy_contract_with_arg(name, arg) {
    const Contract = await ethers.getContractFactory(name);
    const contract = await Contract.deploy(arg);
    await contract.deployed();
    return contract;
}

async function deploy_proxy(contract_name, args = [], initializer = "initialize") {
    const Box = await ethers.getContractFactory(contract_name);
    const box = await upgrades.deployProxy(Box, args, { initializer: initializer });
    return box.deployed();
}

async function upgrade_proxy(new_contract_name, deployed_address) {
    let Contract = await ethers.getContractFactory(new_contract_name);
    return upgrades.upgradeProxy(deployed_address, Contract);
}

async function send_message(contract_posts, message) {
    return contract_posts.send_message(message, {
        value: FEE
    }).then(tx => { tx.wait });
}

async function expect_error_message(f, error_message) {
    try {
        await f();
        expect(false, "expected '" + error_message + "' error, but no error thrown")
    } catch (error) {
        const isExpectedError = error.message.search(error_message) >= 0;
        expect(isExpectedError, "expected error '" + error_message + "' but got: " + error)
    }
}

async function own_address() {
    const [owner] = await ethers.getSigners();
    return owner.address;
}

async function balance_on_address(address) {
    return parseInt(await provider.getBalance(address));
}

module.exports = {
    deploy_contract,
    deploy_contract_with_arg,
    deploy_proxy,
    upgrade_proxy,
    send_message,
    expect_error_message,
    own_address,
    balance_on_address,
    FEE
}