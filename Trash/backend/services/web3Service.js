const { ethers } = require('ethers');
const Group = require('../models/Group');
const EmfireGroup = require('../../contracts/EmfireGroup.json');

let provider;
let contract;

const initializeWeb3 = () => {
  provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
  contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    EmfireGroup.abi,
    provider
  );
};

const createGroupContract = async (name, members) => {
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  const factory = new ethers.ContractFactory(
    EmfireGroup.abi,
    EmfireGroup.bytecode,
    wallet
  );

  const contract = await factory.deploy(name, members);
  await contract.deployed();
  return contract.address;
};

const getContractInstance = () => contract;

module.exports = {
  initializeWeb3,
  createGroupContract,
  getContractInstance
};