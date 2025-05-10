const hre = require("hardhat");

async function main() {
  const EmfireGroup = await hre.ethers.getContractFactory("EmfireGroup");
  const contract = await EmfireGroup.deploy();

  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});