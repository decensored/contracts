require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');

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

const fs = require('fs')
let PRIVATE_KEY = fs.readFileSync('./private_key', 'utf8')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    fantom: {
        url: "https://rpc.ftm.tools/",
        accounts: [`${PRIVATE_KEY}`]
    },
    matic: {
        url: "https://polygon-rpc.com",
        accounts: [`${PRIVATE_KEY}`]
    },
    harmony: {
        url: "https://api.harmony.one",
        accounts: [`${PRIVATE_KEY}`]
    },
    iota: {
        url: "https://we.addiota.com",
        accounts: [`${PRIVATE_KEY}`]
    },
    iota2: {
        url: "https://we2.addiota.com",
        accounts: [`${PRIVATE_KEY}`]
    }
  },
  solidity: {
      version: "0.8.4",
      optimizer: {
          enabled: false,
          runs: 1000
      }
  },
};
