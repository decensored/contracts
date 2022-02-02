const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");

describe("Spaces", function () {

    let contracts;
    let accounts;
    let rate_control;
    let spaces;

    let space1_name = "helloworld";
    let space2_name = "helloworld2";

    let space1_id;
    let space2_id;

    let blacklist = [3, 6, 7];

    it("Deploy contract", async function () {

        contracts = await utils.deploy_proxy("Contracts");

        rate_control = await utils.deploy_proxy("RateControl");
        accounts = await utils.deploy_proxy("Accounts", [contracts.address]);
        spaces = await utils.deploy_proxy("Spaces", [contracts.address]);

        await contracts.set_rate_control(rate_control.address);
        await contracts.set_accounts(accounts.address);
        await contracts.set_spaces(spaces.address);
    });

    it("Create Space", async function () {
        await rate_control.set_rate(await utils.own_address(), 10);
        await spaces.create(space1_name, "");
    });

    it("Set Space Description", async function () {
        let description = "a space";
        let space_id = await spaces.id_by_name(space1_name);
        await spaces.set_description(space_id, description);
        let space = await spaces.spaces(space_id);
        expect(space[3]).to.equal(description);
    });

    it("Fail creating space with existing name", async function () {
        await utils.expect_error_message(async () => {
            await spaces.create(space1_name, "");
        }, "cannot create space: a space with this name already exists");
    });

    it("Create Space with other name", async function () {
        await spaces.create(space2_name, "");
    });

    it("Spaces have expected IDs", async function () {
        space1_id = await spaces.id_by_name(space1_name);
        space2_id = await spaces.id_by_name(space2_name);
        expect(space1_id).to.equal(1);
        expect(space2_id).to.equal(2);
    });

    it("New space has empty blacklist", async function () {
        for(let account = 0; account < 10; account++) {
            let is_blacklisted = await spaces.is_blacklisted(space1_id, account);
            expect(is_blacklisted).to.equal(false);
        }
    });

    it("Accounts can be blacklisted", async function () {

        for(let i = 0; i < blacklist.length; i++) {
            await spaces.add_account_to_blacklist(space1_id, blacklist[i]);
        }

        for(let account = 0; account < 10; account++) {
            let is_blacklisted = await spaces.is_blacklisted(space1_id, account);
            expect(is_blacklisted).to.equal(blacklist.includes(account));
        }
    });

    it("Space2 has empty blacklist after accounts added to space1's blacklist", async function () {
        for(let account = 0; account < 10; account++) {
            let is_blacklisted = await spaces.is_blacklisted(space2_id, account);
            expect(is_blacklisted).to.equal(false);
        }
    });

    it("Accounts can be removed from blacklist", async function () {

        await spaces.remove_account_from_blacklist(space1_id, blacklist[0]);
        blacklist = blacklist.slice(1, 3);

        for(let account = 0; account < 10; account++) {
            let is_blacklisted = await spaces.is_blacklisted(space1_id, account);
            expect(is_blacklisted).to.equal(blacklist.includes(account));
        }
    });
});