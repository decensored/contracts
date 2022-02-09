const { expect, assert } = require("chai");
const { ethers, waffle } = require("hardhat");
const { sha256 } = require("ethers/lib/utils");

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

async function submit_post(contract_posts, space, message) {
    return contract_posts.submit_post(space, message, {
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

function string_to_bytes(str) {
    let utf8Encode = new TextEncoder();
    return utf8Encode.encode(str);
}

async function deploy_all_contracts(amount_of_nonces) {

    let c = {};

    c.contracts = await deploy_proxy("Contracts");
    c.rate_control = await deploy_proxy("RateControl");
    c.tokens = await deploy_proxy("Tokens", []);
    c.accounts = await deploy_proxy("Accounts", [c.contracts.address]);
    c.spaces = await deploy_proxy("Spaces", [c.contracts.address]);
    c.posts = await deploy_proxy("Posts", [c.contracts.address]);
    c.upvotes = await deploy_proxy("Upvotes", [c.contracts.address]);
    c.dao = await deploy_proxy("DAO", [c.contracts.address]);

    await c.contracts.set_rate_control(c.rate_control.address);
    await c.contracts.set_accounts(c.accounts.address);
    await c.contracts.set_spaces(c.spaces.address);
    await c.contracts.set_posts(c.posts.address);
    await c.contracts.set_tokens(c.tokens.address);
    await c.contracts.set_upvotes(c.upvotes.address);
    await c.contracts.set_dao(c.dao.address);

    await c.rate_control.set_rate((await own_address()), 10);

    c.nonces = [];
    for(let i = 0; i < amount_of_nonces; i++) {
        let nonce = "nonce#"+i;
        c.nonces.push(nonce);
        let hash = sha256(string_to_bytes(nonce));
        await c.tokens.add_token_hash(hash)
    }

    return c;
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
    string_to_bytes,
    deploy_all_contracts,
}