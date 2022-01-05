const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");

describe("Posts", function () {

    let contract;
    let message = "Hola, mundo!";
    let contract_balance_before_withdrawal;

    it("Should be able to deploy contract", async function () {
        contract = await utils.deploy_contract("Posts");
    });

    it("get_latest_message_index() should be -1 after deployment", async function () {
        expect(await contract.get_latest_message_index()).to.equal(-1);
    });

    it("Should be able to submit a post", async function () {
        await utils.send_message(contract, message)
    });

    it("get_latest_message_index() should be 0 after first post submitted", async function () {
        expect(await contract.get_latest_message_index()).to.equal(0);
    });

    it("Post on blockchain should equal post sent", async function () {
        const [ret_message, ret_author, _] = await contract.get_message(0);
        expect(ret_message).to.equal(message);
        expect(ret_author).to.equal(await utils.own_address());
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
        let funds_received_from_withdrawal = Math.abs(own_balance_after_withdrawal - own_balance_before_withdrawal);

        expect(funds_received_from_withdrawal).to.closeTo(contract_balance_before_withdrawal, utils.FEE * 0.01);
    });
});