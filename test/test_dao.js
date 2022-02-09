const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");

describe("DAO", function () {

    let c;
    const all_voting_weights = [[1, 10], [2, 5], [3, 7]];
    let user2, user3;

    it("Deploy contract", async function () {
        c = await utils.deploy_all_contracts(3);
        await c.rate_control.set_default_rate(100);
    });

    it("Cannot submit proposal before signing up", async function () {
        let deadline = Math.round(new Date() / 1000) + 24 * 3600 + 1000;
        await utils.expect_error_message(async () => {
            await c.dao.propose("Title", "Message", deadline);
        }, "cannot submit proposal: you are not signed in");
    });

    it("Cannot submit proposal ending in less than 24h", async function () {
        [_, user2, user3] = await ethers.getSigners();
        await c.accounts.sign_up("user1", c.nonces.pop());
        await c.accounts.connect(user2).sign_up("user2", c.nonces.pop());
        await c.accounts.connect(user3).sign_up("user3", c.nonces.pop());

        let deadline = Math.round(new Date() / 1000) + 24 * 3600 - 1000;
        await utils.expect_error_message(async () => {
            await c.dao.propose("Title", "Message", deadline);
        }, "cannot submit proposal: deadline needs to be at least 24h in the future");
    });

    it("Can submit proposal", async function () {
        let deadline = Math.round(new Date() / 1000) + 24 * 3600 + 1000;
        await c.dao.propose("Title", "Message", deadline);
    });

    it("Can set voting weights", async function () {
        for(let i = 0; i < all_voting_weights.length; i++) {
            let entry = all_voting_weights[i];
            let account_id = entry[0];
            let voting_weight = entry[1];
            await c.dao.set_voting_weight(account_id, voting_weight);
        }
        for(let i = 0; i < all_voting_weights.length; i++) {
            let entry = all_voting_weights[i];
            let account_id = entry[0];
            let expected_voting_weight = entry[1];
            let actual_voting_weight = await c.dao.voting_weight_by_account(account_id);
            expect(actual_voting_weight).to.equal(expected_voting_weight);
        }
    });

    it("Can vote", async function () {
        await c.dao.vote(1, 1);
        let voting_weight1 = all_voting_weights[0][1];
        let proposal_and_account = await c.dao._encode_two_uint64_as_uint128(1, 1);
        let [_0, _1, _2, _3, weighted_votes_sum, weighted_votes_abs] = await c.dao.proposals(1);
        expect(weighted_votes_sum).to.equal(voting_weight1);
        expect(weighted_votes_abs).to.equal(voting_weight1);
        expect(await c.dao.vote_by_proposal_and_account(proposal_and_account)).to.equal(voting_weight1);
    });

    it("Cannot vote with vote value < -1 or > 1", async function () {
        await utils.expect_error_message(async () => {
            await c.dao.vote(1, -2);
        }, "cannot vote: invalid vote value");
        await utils.expect_error_message(async () => {
            await c.dao.vote(1, 2);
        }, "cannot vote: invalid vote value");
    });

    it("Can change vote", async function () {
        await c.dao.vote(1, -1);
        let voting_weight1 = all_voting_weights[0][1];
        let proposal_and_account = await c.dao._encode_two_uint64_as_uint128(1, 1);
        let [_0, _1, _2, _3, weighted_votes_sum, weighted_votes_abs] = await c.dao.proposals(1);
        expect(weighted_votes_sum).to.equal(-voting_weight1);
        expect(weighted_votes_abs).to.equal(voting_weight1);
        expect(await c.dao.vote_by_proposal_and_account(proposal_and_account)).to.equal(-voting_weight1);
    });

    it("Can take back vote", async function () {
        await c.dao.vote(1, 0);
        let proposal_and_account = await c.dao._encode_two_uint64_as_uint128(1, 1);
        let [_0, _1, _2, _3, weighted_votes_sum, weighted_votes_abs] = await c.dao.proposals(1);
        expect(weighted_votes_sum).to.equal(0);
        expect(weighted_votes_abs).to.equal(0);
        expect(await c.dao.vote_by_proposal_and_account(proposal_and_account)).to.equal(0);
    });

    it("Votes are added up", async function () {
        await c.dao.vote(1, 1);
        await c.dao.connect(user2).vote(1, -1);
        await c.dao.connect(user3).vote(1, -1);

        let expected_sum = all_voting_weights[0][1] - all_voting_weights[1][1] - all_voting_weights[2][1];
        let expected_abs = all_voting_weights[0][1] + all_voting_weights[1][1] + all_voting_weights[2][1];

        let [_0, _1, _2, _3, weighted_votes_sum, weighted_votes_abs] = await c.dao.proposals(1);
        expect(weighted_votes_sum).to.equal(expected_sum);
        expect(weighted_votes_abs).to.equal(expected_abs);
    });
});