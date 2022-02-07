require("dotenv").config();

const { Contract } = require("ethers");
const hre = require("hardhat");
const utils = require("./utils.js");

const deployment = require("../deployment.json");

async function migrate(contract_name, new_contract_address, old_contract_address) {

    const Contract = await ethers.getContractFactory(contract_name);
    const contract = await Contract.attach(new_contract_address);

    console.log("migrating "+contract_name+"...");
    try {
        const entries_per_iteration = 100;
        for(let index_from = 1; index_from < 1000; index_from += entries_per_iteration) {
            let index_to = index_from+entries_per_iteration-1;
            console.log("migrating #" +index_from+" to #"+index_to);
            await contract.migrate(old_contract_address, index_from, index_to);
        }
    } catch(error) {
        console.log(error.message);
    }
}

async function migrate_accounts(old_accounts_address) {
    migrate("Accounts", deployment.accounts_address, old_accounts_address);
}

async function migrate_posts(old_posts_address) {
    migrate("Posts", deployment.posts_address, old_posts_address);
}

async function migrate_spaces(old_spaces_address) {
    migrate("Spaces", deployment.spaces_address, old_spaces_address);
}

//migrate_accounts("0xa23F9590b073440a2F98c6dD5FE76eA804868849", 101, 200).then(console.log);
//migrate_spaces("0x26Bd3aa5eDa148dAD7f3EF996823559a184C4A8d", 1, 100).then(console.log);
migrate_posts("0x6F1C82EAb06F2b52fCff72e81908C11BA017e93d", 1, 100).then(console.log);