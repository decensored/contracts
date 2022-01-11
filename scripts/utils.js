const { expect, assert } = require("chai");
const { ethers, waffle } = require("hardhat");

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
    const Proxy = await ethers.getContractFactory(contract_name);
    const proxy = await upgrades.deployProxy(Proxy, args, { initializer: initializer });
    return proxy.deployed();
}

async function upgrade_proxy(new_contract_name, deployed_address) {
    let Contract = await ethers.getContractFactory(new_contract_name);
    return upgrades.upgradeProxy(deployed_address, Contract);
}

async function submit_post(contract_posts, message) {
    return contract_posts.submit_post(message, {
        value: 0
    }).then(tx => { tx.wait });
}

async function expect_error_message(f, error_message) {
    let was_error_thrown;
    try {
        await f();
        was_error_thrown = false;
    } catch (error) {
        was_error_thrown = true;
        if(error.message.search(error_message) <= 0) {
            throw new Error("expected error '" + error_message + "' but got: " + error);
        }
    }
    if(!was_error_thrown) {
        throw new Error("expected '" + error_message + "' error, but no error thrown");
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
    submit_post,
    expect_error_message,
    own_address,
    balance_on_address,
}