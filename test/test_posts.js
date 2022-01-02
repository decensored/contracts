const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

const FEE = "0.09";

async function deploy_contract(name) {
  const Contract = await ethers.getContractFactory(name);
  const contract = await Contract.deploy();
  await contract.deployed();
  return contract;
}

async function deploy_contract_with_arg(name, arg) {
  const Contract = await ethers.getContractFactory(name);
  const contract = await Contract.deploy(arg);
  await contract.deployed();
  return contract;
}

async function expect_error_message(f, error_message) {
  try {
    await f();
    expect(false, "expected '"+error_message+"' error, but no error thrown")
  } catch(error) {
    const isExpectedError = error.message.search(error_message) >= 0;
    expect(isExpectedError, "expected error '"+error_message+"' but got: " + error)
  }
}

describe("Posts", function () {
  
  it("Should add a message when send_message() called", async function () {
    const contract = await deploy_contract("Posts");

    expect(await contract.get_latest_message_index()).to.equal(-1);

    const message = "Hola, mundo!";
    
    const sendMessageTx = await contract.send_message(message, {
        value: ethers.utils.parseEther(FEE)
    });
    await sendMessageTx.wait();

    const latest_index = await contract.get_latest_message_index();
    expect(latest_index).to.equal(0);
    const [ret_message, ret_author, ret_timestamp] = await contract.get_message(latest_index);
    expect(ret_message).to.equal(message);

    const [owner] = await ethers.getSigners();
    expect(ret_author).to.equal(owner.address);
  });

  it("Should be able to withdraw funds", async function () {
    const contract = await deploy_contract("Posts");

    expect(await contract.get_latest_message_index()).to.equal(-1);

    const message = "Hola, mundo!";
    const sendMessageTx = await contract.send_message(message, {
        value: ethers.utils.parseEther(FEE)
    });
    await sendMessageTx.wait();
    
    const withdrawTx = await contract.withdraw();
    await withdrawTx.wait();

    expect.fail("test does not yet test for arrival of funds");
  });
});