require("dotenv").config();

const { Contract } = require("ethers");
const hre = require("hardhat");
const utils = require("./utils.js");

const deployment = require("../deployment.json");


async function migrate_accounts(old_accounts_address, index_from, index_to) {
    const Accounts = await ethers.getContractFactory("Accounts");
    const accounts = await Accounts.attach(deployment.accounts_address);
    accounts.migrate(old_accounts_address, index_from, index_to);
}

async function migrate_posts(old_posts_address, index_from, index_to) {
    const Posts = await ethers.getContractFactory("Posts");
    const posts = await Posts.attach(deployment.posts_address);
    posts.migrate(old_posts_address, index_from, index_to);
}

async function migrate_spaces(old_spaces_address, index_from, index_to) {
    const Spaces = await ethers.getContractFactory("Spaces");
    const spaces = await Spaces.attach(deployment.spaces_address);
    spaces.migrate(old_spaces_address, index_from, index_to);
}

//migrate_accounts("0xa23F9590b073440a2F98c6dD5FE76eA804868849", 251, 260).then(console.log);
migrate_spaces("0x26Bd3aa5eDa148dAD7f3EF996823559a184C4A8d", 11, 20).then(console.log);