require("dotenv").config();

const hre = require("hardhat");
const utils = require("./utils.js");
const hardhatConfig = require("../hardhat.config.js");
const { ErrorDescription } = require("@ethersproject/abi/lib/interface");

function sleep(ms) {
  // console.error("sleeping " + ms + " ms ...");
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handle_error(error) {
  if (error.message.includes("Bad Gateway")) {
    console.warn("(warning) IOTA EVM node is not yet ready.");
    await sleep(30 * 1000);
    return false;
  } else if (error.message.includes("404 page not found")) {
    console.error("(fatal error) IOTA EVM node needs a restart.");
    return true;
  } else if (error.errno === "ENOTFOUND") {
    console.error("(fatal error) IOTA EVM node seem unreachbale.");
    return true;
  } else {
    console.warn("(warning)", error.message.substr(0, 100));
    await sleep(1 * 1000);
    return false;
  }
}

async function deploy_contract(contract_name, args) {
  let contract;
  console.log("deploy_contract    :", contract_name, args);

  for (;;) {
    try {
      contract = await utils.deploy_proxy(contract_name, args);
      break;
    } catch (e) {
      // console.log(e);
      const fatal_error = await handle_error(e);
      if (fatal_error) process.exit(-1);
    }
  }

  return contract.address;
}

async function deploy_contracts() {
  console.log("network            :", process.env.HARDHAT_NETWORK);

  let ratecontrol_address =
    process.env.RATECONTROL_ADDRESS ||
    (await deploy_contract("RateControl", []));
  console.log("ratecontrol_address:", ratecontrol_address);

  let accounts_address =
    process.env.ACCOUNTS_ADDRESS ||
    (await deploy_contract("Accounts", [ratecontrol_address]));
  console.log("accounts_address   :", accounts_address);

  let spaces_address =
    process.env.SPACES_ADDRESS ||
    (await deploy_contract("Spaces", [accounts_address]));
  console.log("spaces_address     :", spaces_address);

  let posts_address =
    process.env.POSTS_ADDRESS ||
    (await deploy_contract("Posts", [spaces_address]));
  console.log("posts_address      :", posts_address);

  const network = hardhatConfig.networks[process.env.HARDHAT_NETWORK];
  return {
    deeplink: `${process.env.FRONTEND_DOMAIN}?evmNode=${encodeURIComponent(
      network.url
    )}&contractPostsAddress=${encodeURIComponent(posts_address)}`,
    evmNode: network.url,
    // chainId: network.chainId,

    ratecontrol_address,
    accounts_address,
    spaces_address,
    posts_address,
  };
}

async function deploy_NFT_contract() {
    deploy_contract("NFT").then((result) => {
        console.log(result);
    });
}

async function deploy_decensored_contracts() {
    deploy_contracts().then((result) => {
        const fs = require("fs");
        const filename = "deployment.json";
        const json = JSON.stringify(result, null, 2);
        fs.writeFileSync(filename, json);
        console.log("wrote              :", filename);
    
        console.log(json);
    });
}

deploy_decensored_contracts();