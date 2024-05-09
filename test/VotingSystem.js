const CryptoZombies = artifacts.require("VotingSystem");

contract("VotingSystem", (accounts) => {
    let [owner, alice, bob] = accounts;

    it("should be able to create a new ballot", async () => { 
        const contractInstance = await CryptoZombies.new(owner);

        const question = "Do you support this proposal?";
        const options = ["Yes", "No", "Abstain"];
        const startTime = Math.floor(Date.now() / 1000) + 60; 
        const endTime = startTime + 86400;

        const result = await contractInstance.createBallot(question, options, startTime, endTime, { from: owner });

        assert.equal(result.receipt.status, true);
        assert.equal(result.logs[0].args.question, question);
        assert.deepEqual(result.logs[0].args.options, options);
        assert.equal(result.logs[0].args.startTime.toNumber(), startTime);
        assert.equal(result.logs[0].args.endTime.toNumber(), endTime);
    })
})