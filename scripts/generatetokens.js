require("dotenv").config();

const { Contract } = require("ethers");
const hre = require("hardhat");
const utils = require("./utils.js");
const { sha256 } = require("ethers/lib/utils");

const deployment = require("../deployment.json");

function generate_random_string(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

async function main() {
  const Contract = await ethers.getContractFactory("Tokens");
  const contract = await Contract.attach(deployment.tokens_address);

    for(let i = 0; i < 50; i++) {
        let nonce = generate_random_string(8);
        let hash = sha256(utils.string_to_bytes(nonce));
        await contract.add_token_hash(hash);
        console.log("generated signup token: '"+nonce+"'");
    }
}

main().then(console.log);
