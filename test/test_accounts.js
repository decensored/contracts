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
});
