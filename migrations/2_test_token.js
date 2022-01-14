const TestToken = artifacts.require("TestToken");

module.exports = function (deployer) {
  deployer.deploy(TestToken, "10000000000000000000000000000");
};
