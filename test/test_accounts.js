const { expect, assert, util } = require("chai");
const { ethers } = require("hardhat");
const { sha256 } = require("ethers/lib/utils");
const utils = require("../scripts/utils.js");

describe("Accounts", function () {

    let contracts;
    let rate_control;
    let tokens;
    let accounts;
    let nonces = [];
    let [addr0, addr1, addr2] = [undefined, undefined, undefined];

    it("Should be able to deploy contract", async function () {

        contracts = await utils.deploy_proxy("Contracts");

        tokens = await utils.deploy_proxy("Tokens");
        for(let i = 0; i < 10; i++) {
            let nonce = "nonce#"+i;
            nonces.push(nonce);
            let hash = sha256(utils.string_to_bytes(nonce));
            await tokens.add_token_hash(hash)
        }

        rate_control = await utils.deploy_proxy("RateControl");
        await rate_control.set_rate(await utils.own_address(), 10);

        await contracts.set_rate_control(rate_control.address);
        await contracts.set_tokens(tokens.address);

        accounts = await utils.deploy_proxy("Accounts", [contracts.address]);
    });

    it("Should not be able to sign up with username shorter than 4 characters", async function () {
        await utils.expect_error_message(async () => {
            await accounts.sign_up("abc", nonces.pop())
        }, "username must be 4-15 characters long");
    });

    it("Should not be able to sign up with username longer than 15 characters", async function () {
        await utils.expect_error_message(async () => {
            await accounts.sign_up("abcdefghijklmnop", nonces.pop())
        }, "username must be 4-15 characters long");
    });

    it("Should not be able to sign up with username containing illegal characters", async function () {
        await utils.expect_error_message(async () => {
            await accounts.sign_up("not.allowed", nonces.pop())
        }, "username contains illegal characters");
    });

    it("Should be able to sign up", async function () {
        await accounts.sign_up("a2_Z", nonces.pop())
    });

    it("Should not be able to sign up twice", async function () {
        await utils.expect_error_message(async () => {
            await accounts.sign_up("my_alias", nonces.pop());
        }, "cannot sign up: address already signed up");
    });

    it("Should be able to sign up with another address", async function () {
        [addr0, addr1, addr2] = await ethers.getSigners();
        await rate_control.set_rate(addr1.address, 10);
        await accounts.connect(addr1).sign_up("my_alias", nonces.pop());
    });

    it("Should not be able to sign up with another address for same username", async function () {
        await rate_control.set_rate(addr2.address, 10);
        await utils.expect_error_message(async () => {
            await accounts.connect(addr2).sign_up("my_alias", nonces.pop());
        }, "cannot sign up: username already in use");
    });

    // External Addresses Tests
    it("Should not be able to use the same address for external account and decensored account", async function () {
        [addr0] = await ethers.getSigners();
        await utils.expect_error_message(async () => {
            await accounts.addExternAddress(addr0.address)
        }, "You need to send this message via decensored account");
    });

    it("Should add metamask address to connected addresses array", async function () {
        // TODO
        [addr0, addr1] = await ethers.getSigners();
        let account_id = (await accounts.id_by_address(addr0.address)).toNumber()
        
        // Check if unconnected_addresses array is empty
        let my_unconnected_addresses = await accounts.get_unconnected_addresses(account_id)
        expect(my_unconnected_addresses.length).to.equal(0);
        
        // Adds external address
        await accounts.addExternAddress(addr1.address)

        // Check if unconnected_addresses array has one entry
        my_unconnected_addresses = await accounts.get_unconnected_addresses(account_id)
        expect(my_unconnected_addresses.length).to.equal(1);


        const Contract = await ethers.getContractFactory("Accounts");
        const contract = await Contract.attach(accounts.address);

        // validate metamask address
        // use another account (addr1) to sign the tx
        await contract.connect(addr1).validateExternAddress(account_id)
        
        // Check if unconnected_addresses array is empty again
        my_unconnected_addresses = await accounts.get_unconnected_addresses(account_id)
        expect(my_unconnected_addresses.length).to.equal(0);

        // Check if connected_addresses  array has one entry
        let my_connected_addresses = await accounts.get_connected_addresses(account_id)
        expect(my_connected_addresses.length).to.equal(1);

    });

    it("Should not be able to add an metmask account to more than one account", async function () {
        // TODO
    });

});
