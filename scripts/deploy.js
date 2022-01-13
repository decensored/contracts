const hre = require("hardhat");
const utils = require("./utils.js");

function sleep(ms) {
    console.error("sleeping " + ms + " ms ...")
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handle_error(error) {

    if(error.message.includes("Bad Gateway")) {
        console.log("IOTA EVM node is not yet ready.");
        await sleep(30000);
        return false;
    } else if(error.message.includes("404 page not found")) {
        return "IOTA EVM node needs a restart.";
    } else {
        console.error("ERROR " + error.message.substr(0, 100))
        return false;
    }
}

async function deploy_contract_accounts() {
    let contract_accounts = await utils.deploy_proxy("Accounts");
    return contract_accounts.address;
}

async function deploy_contract_posts(accounts_address) {
    let contract_posts = await utils.deploy_proxy("Posts", [accounts_address]);
    return contract_posts.address;
}

async function deploy_contracts() {

    let accounts_address = "";

    for(let i = 0; i < 15; i++) {
        try {
            if(accounts_address !== "") {
                let posts_address = await deploy_contract_posts(accounts_address);
                return posts_address;
            } else {
                accounts_address = await deploy_contract_accounts();
            }
        } catch(e) {
            let fatal_error = await handle_error(e);
            if(fatal_error) {
                return fatal_error;
            }
        }
    }
}

deploy_contracts().then(console.log);