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

    it("get_latest_message_index() should be -1 after deployment", async function () {
        expect(await contract.get_latest_message_index()).to.equal(-1);
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

    it("get_latest_message_index() should be 0 after first post submitted", async function () {
        expect(await contract.get_latest_message_index()).to.equal(0);
    });

    it("Post on blockchain should equal post submitted", async function () {
        const [ret_message, ret_author, _] = await contract.get_post(0);
        expect(ret_message).to.equal(message);
        let author_address = await contract_accounts.address_by_id(ret_author);
        expect(author_address).to.equal(await utils.own_address());
    });

    it("Contract should capture fees", async function () {
        contract_balance_before_withdrawal = await utils.balance_on_address(contract.address);
        expect(""+contract_balance_before_withdrawal).to.equal(utils.FEE);
    });

    it("Should be able to withdraw funds", async function () {

        let own_balance_before_withdrawal = await utils.balance_on_address(await utils.own_address());
        
        const withdrawTx = await contract.withdraw();
        await withdrawTx.wait();

        let own_balance_after_withdrawal = await utils.balance_on_address(await utils.own_address());
        let funds_received_from_withdrawal = Math.abs(own_balance_after_withdrawal - own_balance_after_withdrawal);

        expect(own_balance_after_withdrawal).to.closeTo(own_balance_before_withdrawal + parseInt(utils.FEE), own_balance_before_withdrawal * 0.00000001);
    });
});