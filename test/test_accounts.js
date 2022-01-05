const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");

describe("Accounts", function () {

    let contract;
    let [addr0, addr1, addr2] = [undefined, undefined, undefined];

    it("Should be able to deploy contract", async function () {
        contract = await utils.deploy_proxy("Accounts");
    });

    it("Should not be able to sign up with username shorter than 4 characters", async function () {
        await utils.expect_error_message(async () => {
            await contract.sign_up("abc")
        }, "cannot sign up: username too short");
    });

    it("Should not be able to sign up with username longer than 15 characters", async function () {
        await utils.expect_error_message(async () => {
            await contract.sign_up("abcdefghijklmnop")
        }, "cannot sign up: username too long");
    });

    it("Should not be able to sign up with username containing illegal characters", async function () {
        await utils.expect_error_message(async () => {
            await contract.sign_up("not.allowed")
        }, "cannot sign up: username contains illegal characters");
    });

    it("Should be able to sign up", async function () {
        await contract.sign_up("micro_hash")
    });

    it("Should not be able to sign up twice", async function () {
        await utils.expect_error_message(async () => {
            await contract.sign_up("my_alias");
        }, "cannot sign up: address already signed up");
    });

    it("Should be able to sign up with another address", async function () {
        [addr0, addr1, addr2] = await ethers.getSigners();
        await contract.connect(addr1).sign_up("my_alias");
    });

    it("Should not be able to sign up with another address for same username", async function () {
        await utils.expect_error_message(async () => {
            await contract.connect(addr2).sign_up("my_alias");
        }, "cannot sign up: username already in use");
    });
});