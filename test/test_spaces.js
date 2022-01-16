const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");

describe("Spaces", function () {

    let accounts;
    let rate_control;
    let spaces;

    let space1_name = "helloworld";
    let space2_name = "helloworld2";

    let space1_id;
    let space2_id;

    let members = [3, 6, 7];

    it("Deploy contract", async function () {
        rate_control = await utils.deploy_proxy("RateControl");
        accounts = await utils.deploy_proxy("Accounts", [rate_control.address]);
        spaces = await utils.deploy_proxy("Spaces", [accounts.address]);
    });

    it("Create Space", async function () {
        await rate_control.set_rate_limit(await utils.own_address(), 10);
        await spaces.create(space1_name);
    });

    it("Fail creating space with existing name", async function () {
        await utils.expect_error_message(async () => {
            await spaces.create(space1_name);
        }, "cannot create space: a space with this name already exists");
    });

    it("Create Space with other name", async function () {
        await spaces.create(space2_name);
    });

    it("Spaces have expected IDs", async function () {
        space1_id = await spaces.id_by_name(space1_name);
        space2_id = await spaces.id_by_name(space2_name);
        expect(space1_id).to.equal(1);
        expect(space2_id).to.equal(2);
    });

    it("New space has no members", async function () {
        for(let account = 0; account < 10; account++) {
            let membership = await spaces.is_member(space1_id, account);
            expect(membership).to.equal(false);
        }
    });

    it("Members can be added", async function () {

        for(let i = 0; i < members.length; i++) {
            await spaces.set_membership(space1_id, members[i], true);
        }

        for(let account = 0; account < 10; account++) {
            let membership = await spaces.is_member(space1_id, account);
            expect(membership).to.equal(members.includes(account));
        }
    });

    it("Space2 has no members after members added to space1", async function () {
        for(let account = 0; account < 10; account++) {
            let membership = await spaces.is_member(space2_id, account);
            expect(membership).to.equal(false);
        }
    });

    it("Members can be removed", async function () {

        await spaces.set_membership(space1_id, members[0], false);
        members = members.slice(1, 3);

        for(let account = 0; account < 10; account++) {
            let membership = await spaces.is_member(space1_id, account);
            expect(membership).to.equal(members.includes(account));
        }
    });
});