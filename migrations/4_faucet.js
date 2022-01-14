const FaucetContract = artifacts.require("Faucet.sol");
const TestToken = artifacts.require('TestToken.sol');

module.exports = function (deployer) {
  deployer.deploy(FaucetContract, TestToken.address);
};
