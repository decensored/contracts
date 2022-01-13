const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");

describe("Posts", function () {

    let accounts;
    let spaces;
    let posts;

    let message = "Hola, mundo!";

    it("Should be able to deploy contract", async function () {
        accounts = await utils.deploy_proxy("Accounts");
        spaces = await utils.deploy_proxy("Spaces", [accounts.address]);
        posts = await utils.deploy_proxy("Posts", [spaces.address]);
    });

    it("get_latest_post_index() should be -1 after deployment", async function () {
        expect(await posts.get_latest_post_index()).to.equal(-1);
    });

    it("Should not be able to submit a post before signing up", async function () {
        utils.expect_error_message(async () => {
            await utils.submit_post(posts, 0, message)
        }, "Cannot submit post: you are not signed up");
    });

    it("Should not be able to submit a post before creating being member of space", async function () {
        await accounts.sign_up("micro_hash");
        await spaces.create("space1");
        utils.expect_error_message(async () => {
            await utils.submit_post(posts, 0, message)
        }, "Cannot submit post: you are not member of this space");
    });

    it("Should be able to submit a post as member of space", async function () {
        await spaces.set_membership(1, 1, true);
        await utils.submit_post(posts, 1, message)
    });

    it("get_latest_post_index() should be 0 after first post submitted", async function () {
        expect(await posts.get_latest_post_index()).to.equal(0);
    });

    it("Post on blockchain should equal post submitted", async function () {
        const [ret_message, ret_author, _, __] = await posts.posts(0);
        expect(ret_message).to.equal(message);
        let author_address = await accounts.address_by_id(ret_author);
        expect(author_address).to.equal(await utils.own_address());
    });

    it("Should be able to reply to post", async function () {
        let message = "This is a reply";
        let mother_post_index = await posts.get_latest_post_index();
        await posts.reply(mother_post_index, message);

        let reply_index = await posts.get_latest_post_index();
        expect(reply_index > mother_post_index, "no post submitted");

        const [ret_message, _, __, ___] = await posts.posts(reply_index);
        expect(ret_message).to.equal(message, "Unexpected post message");

        let first_reply = await posts.replies_by_post(mother_post_index, 0);
        expect(first_reply).to.equal(reply_index, "reply was not added as reply to mother post");

        let fetched_mother_post_index = await posts.mother_post_by_reply(reply_index);
        expect(fetched_mother_post_index).to.equal(mother_post_index, "mother post was not added as mother post to reply");
    });
});