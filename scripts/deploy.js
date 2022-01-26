require("dotenv").config();

const hre = require("hardhat");
const utils = require("./utils.js");
const hardhatConfig = require("../hardhat.config.js");

function sleep(ms) {
  console.error("sleeping " + ms + " ms ...");
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handle_error(error) {
  if (error.message.includes("Bad Gateway")) {
    console.log("IOTA EVM node is not yet ready.");
    await sleep(30 * 1000);
    return false;
  } else if (error.message.includes("404 page not found")) {
    return "IOTA EVM node needs a restart.";
  } else {
    console.error("ERROR " + error.message.substr(0, 100));
    return false;
  }
}

async function deploy_contract(contract_name, args) {
  let contract = await utils.deploy_proxy(contract_name, args);
  return contract.address;
}

async function deploy_contracts() {
  let ratecontrol_address = process.env.RATECONTROL_ADDRESS;
  let accounts_address = process.env.ACCOUNTS_ADDRESS;
  let spaces_address = process.env.SPACES_ADDRESS;
  let posts_address = process.env.POSTS_ADDRESS;

  try {
    if (!ratecontrol_address)
      ratecontrol_address = await deploy_contract("RateControl", []);
    // console.log("RateControl: " + ratecontrol_address);

    if (!accounts_address)
      accounts_address = await deploy_contract("Accounts", [
        ratecontrol_address,
      ]);
    // console.log("Accounts: " + accounts_address);

    if (!spaces_address)
      spaces_address = await deploy_contract("Spaces", [accounts_address]);
    // console.log("Spaces: " + spaces_address);

    if (!posts_address)
      posts_address = await deploy_contract("Posts", [spaces_address]);
    // console.log("Posts: " + posts_address);

    const network = hardhatConfig.networks[process.env.NETWORK];
    return {
      evmNode: network.url,
      chainId: network.chainId,
      contractPostsAddress: posts_address,

      ratecontrol_address,
      accounts_address,
      spaces_address,
      posts_address,
    };
  } catch (e) {
    let fatal_error = await handle_error(e);
    if (fatal_error) {
      return fatal_error;
    }
  }
}

// async function upgrade() {
//   let contract = await utils.upgrade_proxy(
//     "Spaces",
//     "0x787eb0FE0448C18F7d9a0B3bf6cE47433106a46e"
//   );
//   return contract.address;
// }

deploy_contracts().then((result) =>
  console.log(JSON.stringify(result, null, 2))
);
