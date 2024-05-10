const VotingSystem = artifacts.require("VotingSystem");
const utils = require("./helpers/utils");
const time = require("./helpers/time");

contract("VotingSystem", (accounts) => {
    let [owner, alice, bob] = accounts;
    let contractInstance;

    beforeEach(async () => {
        contractInstance = await VotingSystem.new(owner);
    });

    describe("Ballot Creation", () => {
        it("should be able to create a new ballot", async () => { 
            const question = "Do you support this proposal?";
            const options = ["Yes", "No", "Abstain"];
            const startTime = (await time.latest()) + time.duration.minutes(1);
            const endTime = startTime + time.duration.days(1);
    
            const result = await contractInstance.createBallot(question, options, startTime, endTime, { from: owner });
    
            assert.equal(result.receipt.status, true);
            assert.equal(result.logs[0].event, "NewBallot");
    
            assert.equal(result.logs[0].args.question, question);
            assert.deepEqual(result.logs[0].args.options, options);
            assert.equal(result.logs[0].args.startTime.toNumber(), startTime);
            assert.equal(result.logs[0].args.endTime.toNumber(), endTime);
        })
    })

    describe("Voting", () => {
        it("should be able to cast a vote on a ballot", async () => {    
            const question = "Do you support this proposal?";
            const options = ["Yes", "No", "Abstain"];
            const startTime = (await time.latest()) + time.duration.minutes(1); 
            const endTime = startTime + time.duration.days(1);
    
            const createdBallotResult = await contractInstance.createBallot(question, options, startTime, endTime, { from: owner });
            const ballotId = createdBallotResult.logs[0].args.ballotId.toNumber();

            await time.increase(time.duration.minutes(2));

            const result = await contractInstance.vote(ballotId, 1, { from: alice });
    
            assert.equal(result.receipt.status, true);
            assert.equal(result.logs[0].event, "Voted");
    
            assert.equal(result.logs[0].args.ballotId.toNumber(), ballotId);
            assert.equal(result.logs[0].args.voter, alice)
            assert.equal(result.logs[0].args.option.toNumber(), 1);
    
            const ongoingBallots = await contractInstance.getOngoingBallots({ from: alice });
    
            assert.isArray(ongoingBallots);
            assert.equal(ongoingBallots[0].question, question);
            assert.deepEqual(ongoingBallots[0].options, options);
            assert.equal(ongoingBallots[0].hasSenderVoted, true);
        })

        it("shoule be able to cast only one vote per ballot", async () => {
            const question = "Do you support this proposal?";
            const options = ["Yes", "No", "Abstain"];
            const startTime = (await time.latest()) + time.duration.minutes(1); 
            const endTime = startTime + time.duration.days(1);
    
            const createdBallotResult = await contractInstance.createBallot(question, options, startTime, endTime, { from: owner });
            const ballotId = createdBallotResult.logs[0].args.ballotId.toNumber();

            await time.increase(time.duration.minutes(2));
            
            await contractInstance.vote(ballotId, 1, { from: alice });

            await utils.shouldThrow(contractInstance.vote(ballotId, 0, { from: alice }));
        })
    })

    describe("Ballot Closing", () => {
        it("should be able to close a ballot", async () => {
            const question = "Do you support this proposal?";
            const options = ["Yes", "No", "Abstain"];
            const startTime = (await time.latest()) + time.duration.minutes(1);
            const endTime = startTime + time.duration.days(1);
    
            const createdBallotResult = await contractInstance.createBallot(question, options, startTime, endTime, { from: owner });
            const ballotId = createdBallotResult.logs[0].args.ballotId.toNumber();

            await time.increase(time.duration.minutes(2));

            const ongoingBallots = await contractInstance.getOngoingBallots({ from: owner });
    
            assert.isArray(ongoingBallots);
            assert.equal(ongoingBallots[0].question, question);
            assert.deepEqual(ongoingBallots[0].options, options);

            await time.increase(time.duration.hours(23));

            const closingBallotResult = await contractInstance.closeBallot(ballotId, { from : owner });

            assert.equal(closingBallotResult.receipt.status, true);
            assert.equal(closingBallotResult.logs[0].event, "BallotClosed");
        })
    })
})