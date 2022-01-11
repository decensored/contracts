const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");

describe("Posts", function () {

    let contract_accounts;
    let contract;
    let message = "Hola, mundo!";
    let contract_balance_before_withdrawal;

    it("Should be able to deploy contract", async function () {
        contract_accounts = await utils.deploy_proxy("Accounts");
        contract = await utils.deploy_proxy("Posts", [contract_accounts.address]);
    });

    it("get_latest_post_index() should be -1 after deployment", async function () {
        expect(await contract.get_latest_post_index()).to.equal(-1);
    });

    it("Should not be able to submit a post before signing up", async function () {
        utils.expect_error_message(async () => {
            await utils.submit_post(contract, message)
        }, "Cannot submit post: you are not signed up");
    });

    it("Should be able to submit a post after signing up", async function () {
        await contract_accounts.sign_up("micro_hash");
        await utils.submit_post(contract, message)
    });

    it("get_latest_post_index() should be 0 after first post submitted", async function () {
        expect(await contract.get_latest_post_index()).to.equal(0);
    });

    it("Post on blockchain should equal post submitted", async function () {
        const [ret_message, ret_author, _] = await contract.get_post(0);
        expect(ret_message).to.equal(message);
        let author_address = await contract_accounts.address_by_id(ret_author);
        expect(author_address).to.equal(await utils.own_address());
    });

    it("Should be able to reply to post", async function () {
        let message = "This is a reply";
        let mother_post_index = await contract.get_latest_post_index();
        await contract.reply(mother_post_index, message);

        let reply_index = await contract.get_latest_post_index();
        expect(reply_index > mother_post_index, "no post submitted");

        const [ret_message, _, __] = await contract.get_post(reply_index);
        expect(ret_message).to.equal(message, "Unexpected post message");

        let first_reply = await contract.replies_by_post(mother_post_index, 0);
        expect(first_reply).to.equal(reply_index, "reply was not added as reply to mother post");

        let fetched_mother_post_index = await contract.mother_post_by_reply(reply_index);
        expect(fetched_mother_post_index).to.equal(mother_post_index, "mother post was not added as mother post to reply");
    });
});