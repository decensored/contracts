require("dotenv").config();

const { Contract } = require("ethers");
const hre = require("hardhat");
const utils = require("./utils.js");

const deployment = require("../deployment.json"); // from last npm run deploy
// console.log(deployment.ratecontrol_address);

async function main() {
  const Contract = await ethers.getContractFactory("RateControl");
  const contract = await Contract.attach(deployment.ratecontrol_address);

  //let address = "0x0d26378E0E6552fc236e1a7FD67341444C74ee40";
  //return await contract.is_below_rate_limit(address);
  //return await contract.set_rate_limit(address, 50);

  await contract.set_rate_control_enabled(false);
  return "rate control disabled";
}

// async function get_addreses() {
//   let posts_address = "0xe040e91728637CD7BB86cd774f3daDE3a96c0717";
//   const Contract = await ethers.getContractFactory("Posts");
//   const contract = await Contract.attach(posts_address);

//   console.log("Spaces: " + (await contract.spaces()));
//   console.log("Accounts: " + (await contract.accounts()));
//   console.log("RateControl: " + (await contract.rate_control()));
// }

main().then(console.log);
