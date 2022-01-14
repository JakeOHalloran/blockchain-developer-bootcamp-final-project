const PrizeDrawContract = artifacts.require("PrizeDrawContract");
const TestToken = artifacts.require('TestToken.sol');

module.exports = function (deployer) {
  deployer.deploy(PrizeDrawContract, TestToken.address);
};
