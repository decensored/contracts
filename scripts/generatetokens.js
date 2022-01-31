require("dotenv").config();

const { Contract } = require("ethers");
const hre = require("hardhat");
const utils = require("./utils.js");
const { sha256 } = require("ethers/lib/utils");

const deployment = require("../deployment.json");

async function main() {
  const Contract = await ethers.getContractFactory("Tokens");
  const contract = await Contract.attach(deployment.tokens_address);

    for(let i = 0; i < 50; i++) {
        let nonce = "nonce#"+i;
        let hash = sha256(utils.string_to_bytes(nonce));
        await contract.add_token_hash(hash);
        console.log("generated nonce: '"+nonce+"'");
    }
}

main().then(console.log);
