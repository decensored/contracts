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

async function deploy_contract(contract_name, args) {
    let contract = await utils.deploy_proxy(contract_name, args);
    return contract.address;
}

async function deploy_contracts() {

    let rate_control_address = "";
    let accounts_address = "";
    let spaces_address = "";

    for(let i = 0; i < 15; i++) {
        try {
            if(spaces_address !== "") {
                let posts_address = await deploy_contract("Posts", [spaces_address]);
                return posts_address;
            } else if(accounts_address !== "") {
                spaces_address = await deploy_contract("Spaces", [accounts_address]);
            } else if(rate_control_address !== "") {
                accounts_address = await deploy_contract("Accounts", [rate_control_address]);
            } else {
                rate_control_address = await deploy_contract("RateControl", []);
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