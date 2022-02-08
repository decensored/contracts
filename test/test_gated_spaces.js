const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");
const { sha256 } = require("ethers/lib/utils");

describe("NFT Gated Spaces", function () {
  let contracts;
  let accounts;
  let rate_control;
  let spaces;
  let posts;

  let space1_name = "helloworld";
  let space2_name = "helloworld2";

  let space1_id;
  let space2_id;

  let blacklist = [3, 6, 7];

  let nft_contract;
  let nft_address;

  let message = "Hola, mundo!";

  let nonces = [];

  it("Deploy contract", async function () {
    contracts = await utils.deploy_proxy("Contracts");

    rate_control = await utils.deploy_proxy("RateControl");
    accounts = await utils.deploy_proxy("Accounts", [contracts.address]);
    spaces = await utils.deploy_proxy("Spaces", [contracts.address]);
    posts = await utils.deploy_proxy("Posts", [contracts.address]);
    tokens = await utils.deploy_proxy("Tokens", []);

    await rate_control.set_rate(await utils.own_address(), 10);

    for (let i = 0; i < 1; i++) {
      let nonce = "nonce#" + i;
      nonces.push(nonce);
      let hash = sha256(utils.string_to_bytes(nonce));
      await tokens.add_token_hash(hash);
    }

    await contracts.set_rate_control(rate_control.address);
    await contracts.set_accounts(accounts.address);
    await contracts.set_spaces(spaces.address);
    await contracts.set_posts(posts.address);
    await contracts.set_tokens(tokens.address);

    const Contract = await ethers.getContractFactory("TestNFT");
    nft_contract = await Contract.deploy(
      "My NFT",
      "MNFT",
      "https://robohash.org/test-1.png"
    );

    await nft_contract.deployed();
    nft_address = nft_contract.address;
  });

  it("get_amount_of_posts() should be 0 after deployment", async function () {
    expect(await posts.get_amount_of_posts()).to.equal(0);
  });

  it("Should not be able to submit a post before signing up", async function () {
    utils.expect_error_message(async () => {
      await utils.submit_post(posts, 0, message);
    }, "Cannot submit post: you are not signed up");
  });

  it("Submit a post to space with an NFT", async function () {
    [addr1] = await ethers.getSigners();

    await accounts.sign_up("user1", nonces.pop());
    await nft_contract.safeMint(addr1.address, 1);

    await spaces.create("space1", "", nft_address);

    let post_address = await contracts.posts();

    const Contract = await ethers.getContractFactory("Posts");
    const contract = await Contract.attach(post_address);

    expect(await posts.get_amount_of_posts()).to.equal(0);
    await contract.connect(addr1).submit_post(1, message, {
      value: 0,
    });
    expect(await posts.get_amount_of_posts()).to.equal(1);
  });

  it("Should not be able to post a message without an NFT", async function () {
    await utils.expect_error_message(async () => {
      [addr1, addr2] = await ethers.getSigners();

      await nft_contract.transferFrom(addr1.address, addr2.address, 1);
      let post_address = await contracts.posts();

      const Contract = await ethers.getContractFactory("Posts");
      const contract = await Contract.attach(post_address);

      await contract.connect(addr1).submit_post(1, message, {
        value: 0,
      });
    }, "Cannot submit post: you don't have the rights to post in this space!");
  });
});
