const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");

describe("Upvotes", function () {

    let c;
    let signer1, signer2;

    it("Deploy contract", async function () {
        c = await utils.deploy_all_contracts(3);
        await c.rate_control.set_default_rate(100);
    });

    it("Can vote", async function () {
        await c.accounts.sign_up("micro", c.nonces.pop());
        await c.upvotes.vote(0, 0);
    });

    it("Cannot vote on own posts", async function () {
        await c.spaces.create("space1", "", "0x0000000000000000000000000000000000000000");
        await utils.submit_post(c.posts, 1, "Hello world!")
        await utils.expect_error_message(async () => {
            await c.upvotes.vote(1, 0);
        }, "you cannot vote on your own posts")
    });

    it("Can vote on others post", async function () {

        [_, signer1, signer2] = await ethers.getSigners();

        await c.accounts.connect(signer1).sign_up("signer1", c.nonces.pop());
        await c.accounts.connect(signer2).sign_up("signer2", c.nonces.pop());

        await c.upvotes.connect(signer1).vote(1, 1);
        await c.upvotes.connect(signer2).vote(1, 1);

        let post_score = await c.upvotes.score_by_post(1);
        let author_score = await c.upvotes.score_by_author(1);

        expect(post_score).to.equal(2);
        expect(author_score).to.equal(2);
    });

    it("Can change votes", async function () {
        await c.upvotes.connect(signer1).vote(1, -1);

        let post_score = await c.upvotes.score_by_post(1);
        let author_score = await c.upvotes.score_by_author(1);

        expect(post_score).to.equal(0);
        expect(author_score).to.equal(0);
    });

    it("Cannot vote twice", async function () {
        await c.upvotes.connect(signer1).vote(1, -1);

        let post_score = await c.upvotes.score_by_post(1);
        let author_score = await c.upvotes.score_by_author(1);

        expect(post_score).to.equal(0);
        expect(author_score).to.equal(0);
    });
});