const { expect, assert } = require("chai");
const { sha256 } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");

describe("Tokens", function () {

    let tokens;
    let nonce = "Hello world!";
    let not_nonce = "Hello moon!";

    it("Deploy contract", async function () {
        tokens = await utils.deploy_proxy("Tokens");
    });

    it("Cannot use token before added", async function () {
        await utils.expect_error_message(async () => {
            await tokens.use_token(nonce);
        }, 'invalid token');
    });

    it("Add a token", async function () {
        let hash = sha256(utils.string_to_bytes(nonce));
        await tokens.add_token_hash(hash);
    });

    it("Cannot use incorrect token", async function () {
        await utils.expect_error_message(async () => {
            await tokens.use_token(not_nonce);
        }, 'invalid token');
    });

    it("Use token", async function () {
        await tokens.use_token(nonce);
    });

    it("Cannot use token again", async function () {
        await utils.expect_error_message(async () => {
            await tokens.use_token(nonce);
        }, 'invalid token');
    });
});