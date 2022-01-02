const hre = require("hardhat");

async function main() {

  const MyContract = await ethers.getContractFactory("Posts");
  const contract = await MyContract.attach("0x725fCCe5ff4b248879fEa9663DDd1033695064Dd");

  let res = await contract.withdraw();
  console.log(res)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
