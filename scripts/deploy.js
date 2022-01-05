const hre = require("hardhat");
const utils = require("./utils.js");

async function main() {
    //let contract_posts = await utils.deploy_proxy("Posts");
    //let contract_posts = await utils.upgrade_proxy("Posts", "0x6DCaB77ddA1b5597360e238942E5bd8958b3Dd7B");
    //console.log("Posts deployed to:", contract_posts.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
