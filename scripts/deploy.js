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

  let contracts_address =
    process.env.CONTRACTS_ADDRESS ||
    (await deploy_contract("Contracts", []));
  console.log("contracts_address  :", contracts_address);

  let rate_control_address =
    process.env.RATECONTROL_ADDRESS ||
    (await deploy_contract("RateControl", []));
  console.log("ratecontrol_address:", rate_control_address);

  let tokens_address =
    process.env.TOKENS_ADDRESS ||
    (await deploy_contract("Tokens", []));
  console.log("tokens_address     :", tokens_address);

  let accounts_address =
    process.env.ACCOUNTS_ADDRESS ||
    (await deploy_contract("Accounts", [contracts_address]));
  console.log("accounts_address   :", accounts_address);

  let spaces_address =
    process.env.SPACES_ADDRESS ||
    (await deploy_contract("Spaces", [contracts_address]));
  console.log("spaces_address     :", spaces_address);

  let posts_address =
    process.env.POSTS_ADDRESS ||
    (await deploy_contract("Posts", [contracts_address]));
  console.log("posts_address      :", posts_address);

  let upvotes_address =
    process.env.UPVOTES_ADDRESS ||
    (await deploy_contract("Upvotes", [contracts_address]));
  console.log("upvotes_address    :", upvotes_address);

  let dao_address =
    process.env.DAO_ADDRESS ||
    (await deploy_contract("Dao", [contracts_address]));
  console.log("dao_address       :", dao_address);

  const Contracts = await ethers.getContractFactory("Contracts");
  const contracts = await Contracts.attach(contracts_address);
  await contracts.set_rate_control(rate_control_address);
  await contracts.set_tokens(tokens_address);
  await contracts.set_accounts(accounts_address);
  await contracts.set_spaces(spaces_address);
  await contracts.set_posts(posts_address);
  await contracts.set_upvotes(upvotes_address);
  await contracts.set_dao(dao_address);

  const RateControl = await ethers.getContractFactory("RateControl");
  const rateControl = await RateControl.attach(rate_control_address);
  await rateControl.set_default_rate(10);


  const network = hardhatConfig.networks[process.env.HARDHAT_NETWORK];
  const LOCAL_HARDHAT_NODE = 'http://localhost:8545'
  return {
    // http://localhost:3000/deeplink/customnode/<evmNode>/<contractsAddress> 
    deeplink: `${process.env.FRONTEND_DOMAIN}/deeplink/customnode/${encodeURIComponent(
      network?.url ?? LOCAL_HARDHAT_NODE
    )}/${encodeURIComponent(contracts_address)}`,
    evmNode: network?.url ?? LOCAL_HARDHAT_NODE,
    // chainId: network.chainId,

    contracts_address,
    rate_control_address,
    tokens_address,
    accounts_address,
    spaces_address,
    posts_address,
    upvotes_address,
    dao_address,
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