const hre = require("hardhat");
const utils = require("./utils.js");

async function main() {

    let accounts_address = "";

    try {
        if(accounts_address !== "") {
            let contract_posts = await utils.deploy_proxy("Posts", [accounts_address]);
            console.log("Posts deployed to:", contract_posts.address);
        } else {
            let contract_accounts = await utils.deploy_proxy("Accounts");
            console.log("Accounts deployed to:", contract_accounts.address);
    
            let contract_posts = await utils.deploy_proxy("Posts", [contract_accounts.address]);
            console.log("Posts deployed to:", contract_posts.address);
        }
    } catch(e) {
        console.log("ERROR" + e)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
