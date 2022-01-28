const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");

describe("Accounts", function () {

    let rate_control;
    let contract;
    let [addr0, addr1, addr2] = [undefined, undefined, undefined];

    it("Should be able to deploy contract", async function () {
        rate_control = await utils.deploy_proxy("RateControl");
        await rate_control.set_rate_limit(await utils.own_address(), 10);
        contract = await utils.deploy_proxy("Accounts", [rate_control.address]);
    });

    it("Should not be able to sign up with username shorter than 4 characters", async function () {
        await utils.expect_error_message(async () => {
            await contract.sign_up("abc")
        }, "username must be 4-15 characters long");
    });

    it("Should not be able to sign up with username longer than 15 characters", async function () {
        await utils.expect_error_message(async () => {
            await contract.sign_up("abcdefghijklmnop")
        }, "username must be 4-15 characters long");
    });

    it("Should not be able to sign up with username containing illegal characters", async function () {
        await utils.expect_error_message(async () => {
            await contract.sign_up("not.allowed")
        }, "username contains illegal characters");
    });

    it("Should be able to sign up", async function () {
        await contract.sign_up("a2_Z")
    });

    it("Should not be able to sign up twice", async function () {
        await utils.expect_error_message(async () => {
            await contract.sign_up("my_alias");
        }, "cannot sign up: address already signed up");
    });

    it("Should be able to sign up with another address", async function () {
        [addr0, addr1, addr2] = await ethers.getSigners();
        await rate_control.set_rate_limit(addr1.address, 10);
        await contract.connect(addr1).sign_up("my_alias");
    });

    it("Should not be able to sign up with another address for same username", async function () {
        await rate_control.set_rate_limit(addr2.address, 10);
        await utils.expect_error_message(async () => {
            await contract.connect(addr2).sign_up("my_alias");
        }, "cannot sign up: username already in use");
    });
});
