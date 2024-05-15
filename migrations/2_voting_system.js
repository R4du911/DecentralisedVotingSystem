const VotingSystem = artifacts.require("VotingSystem");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(VotingSystem, { from: accounts[0] });
};