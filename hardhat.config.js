require("dotenv").config();

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    fantom: {
      url: "https://rpc.ftm.tools/",
      accounts: [process.env.PRIVATEKEY],
    },
    matic: {
      url: "https://polygon-rpc.com",
      accounts: [process.env.PRIVATEKEY],
    },
    harmony: {
      url: "https://api.harmony.one",
      accounts: [process.env.PRIVATEKEY],
    },
    "iota-we.addiota.com": {
      url: "https://we.addiota.com",
      accounts: [process.env.PRIVATEKEY],
    },
    "iota-we2.addiota.com": {
      url: "https://we2.addiota.com",
      accounts: [process.env.PRIVATEKEY],
    },
    "iota-we.jamesayden.com": {
      url: "https://we.jamesayden.com",
      accounts: [process.env.PRIVATEKEY],
    },
    "hh.addiota.com": {
      url: "https://hh.addiota.com",
      accounts: [process.env.PRIVATEKEY],
      gasprice: 0,
    },
    "iota-evm.wasp.sc.iota.org": {
      url: "https://evm.wasp.sc.iota.org",
      chainId: 1074,
      gasprice: 0,
      accounts: [process.env.PRIVATEKEY],
      timeout: 60000,
    },

    "iota-evm.wasp.sc.iota-defi.com": {
      url: "https://evm.wasp.sc.iota-defi.com",
      chainId: 1075,
      gasprice: 0,
      accounts: [process.env.PRIVATEKEY],
      timeout: 60000,
    },

    "iota-evm.wasp.sc.coordicide.com": {
      url: "https://evm.wasp.sc.coordicide.com",
      chainId: 1076,
      gasprice: 0,
      accounts: [process.env.PRIVATEKEY],
      timeout: 60000,
    },
    strangled: {
      url: "https://evm.iotabot.strangled.net/",
      chainId: 1076,
      accounts: [process.env.PRIVATEKEY],
      timeout: 120000
    },
  },
  solidity: {
    version: "0.8.4",
    optimizer: {
      enabled: false,
      runs: 1000,
    },
  },
};
