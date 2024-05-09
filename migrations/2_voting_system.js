const VotingSystem = artifacts.require("VotingSystem");

module.exports = function (deployer, _network, accounts) {
  const initialOwner = accounts[0];
  deployer.deploy(VotingSystem, initialOwner);
};