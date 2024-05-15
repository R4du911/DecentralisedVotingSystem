const VotingSystem = artifacts.require("VotingSystem");
const utils = require("./helpers/utils");
const time = require("./helpers/time");

contract("VotingSystem", (accounts) => {
    let [owner, alice, bob] = accounts;
    let contractInstance;

    beforeEach(async () => {
        contractInstance = await VotingSystem.new();
    });

    describe("Ballot Creation", () => {
        it("should be able to create a new ballot", async () => { 
            const question = "Do you support this proposal?";
            const options = ["Yes", "No", "Abstain"];
            const endTime = (await time.latest()) + time.duration.days(1);
    
            const result = await contractInstance.createBallot(question, options, endTime, { from: owner });
    
            assert.equal(result.receipt.status, true);
            assert.equal(result.logs[0].event, "NewBallot");
    
            assert.equal(result.logs[0].args.question, question);
            assert.deepEqual(result.logs[0].args.options, options);
            assert.equal(result.logs[0].args.endTime.toNumber(), endTime);
        })
    })

    describe("Voting", () => {
        it("should be able to cast a vote on a ballot", async () => {    
            const question = "Do you support this proposal?";
            const options = ["Yes", "No", "Abstain"];
            const endTime = (await time.latest()) + time.duration.days(1);
    
            const createdBallotResult = await contractInstance.createBallot(question, options, endTime, { from: owner });
            const ballotId = createdBallotResult.logs[0].args.ballotId.toNumber();

            const result = await contractInstance.vote(ballotId, 1, { from: alice });
    
            assert.equal(result.receipt.status, true);
            assert.equal(result.logs[0].event, "Voted");
    
            assert.equal(result.logs[0].args.ballotId.toNumber(), ballotId);
            assert.equal(result.logs[0].args.voter, alice)
            assert.equal(result.logs[0].args.option.toNumber(), 1);
    
            const ongoingBallotsAlice = await contractInstance.getOngoingBallots({ from: alice });
    
            assert.isArray(ongoingBallotsAlice);
            assert.equal(ongoingBallotsAlice[0].ballotId, ballotId);
            assert.equal(ongoingBallotsAlice[0].hasSenderVoted, true);

            const ongoingBallotsBob = await contractInstance.getOngoingBallots({ from: bob });
    
            assert.isArray(ongoingBallotsBob);
            assert.equal(ongoingBallotsBob[0].ballotId, ballotId);
            assert.equal(ongoingBallotsBob[0].hasSenderVoted, false);
        })

        it("should be able to cast only one vote per ballot", async () => {
            const question = "Do you support this proposal?";
            const options = ["Yes", "No", "Abstain"];
            const endTime = (await time.latest()) + time.duration.days(1);
    
            const createdBallotResult = await contractInstance.createBallot(question, options, endTime, { from: owner });
            const ballotId = createdBallotResult.logs[0].args.ballotId.toNumber();
            
            await contractInstance.vote(ballotId, 1, { from: alice });

            await utils.shouldThrow(contractInstance.vote(ballotId, 0, { from: alice }));
        })
    })

    describe("Ballot Closing", () => {
        it("should be able to close a ballot", async () => {
            const question = "Do you support this proposal?";
            const options = ["Yes", "No", "Abstain"];
            const endTime = (await time.latest()) + time.duration.days(1);
    
            const createdBallotResult = await contractInstance.createBallot(question, options, endTime, { from: owner });
            const ballotId = createdBallotResult.logs[0].args.ballotId.toNumber();

            const ongoingBallots = await contractInstance.getOngoingBallots({ from: owner });
    
            assert.isArray(ongoingBallots);
            assert.equal(ongoingBallots[0].ballotId, ballotId);

            await time.increase(time.duration.minutes(2));

            const closingBallotResult = await contractInstance.closeBallot(ballotId, { from : owner });

            assert.equal(closingBallotResult.receipt.status, true);
            assert.equal(closingBallotResult.logs[0].event, "BallotClosed");

            const closedBallots = await contractInstance.getClosedBallots({ from : owner });

            assert.isArray(closedBallots);
            assert.equal(closedBallots[0].ballotId, ballotId);
        })
    })

    describe("Get Ongoing Ballots", () => {
        it("should retrieve all ongoing ballots with the sender's voting status", async () => {
            const questionBallotOne = "Do you support this proposal?";
            const optionsBallotOne = ["Yes", "No", "Abstain"];
            const endTimeBallotOne = (await time.latest()) + time.duration.days(1);
    
            const createdBallotOneResult = await contractInstance.createBallot(questionBallotOne, optionsBallotOne, 
                endTimeBallotOne, { from: owner });
            const ballotOneId = createdBallotOneResult.logs[0].args.ballotId.toNumber();

            const questionBallotTwo = "Do you agree?";
            const optionsBallotTwo = ["Yes", "No", "Maybe"];
            const endTimeBallotTwo = (await time.latest()) + time.duration.days(1);

            const createdBallotTwoResult = await contractInstance.createBallot(questionBallotTwo, optionsBallotTwo, 
                endTimeBallotTwo, { from : owner });
            const ballotTwoId = createdBallotTwoResult.logs[0].args.ballotId.toNumber();

            await contractInstance.vote(ballotOneId, 1, { from: alice });

            const ongoingBallots = await contractInstance.getOngoingBallots({ from: alice });
    
            assert.isArray(ongoingBallots);
            assert.equal(ongoingBallots[0].ballotId, ballotOneId);
            assert.equal(ongoingBallots[0].hasSenderVoted, true);

            assert.equal(ongoingBallots[1].ballotId, ballotTwoId);
            assert.equal(ongoingBallots[1].hasSenderVoted, false);
        })
    })

    describe("Get Closed Ballots", () => {
        it("should retrieve all closed ballots with the voter's result", async () => {
            const questionBallotOne = "Do you support this proposal?";
            const optionsBallotOne = ["Yes", "No", "Abstain"];
            const endTimeBallotOne = (await time.latest()) + time.duration.days(1);
    
            const createdBallotOneResult = await contractInstance.createBallot(questionBallotOne, optionsBallotOne, 
                endTimeBallotOne, { from: owner });
            const ballotOneId = createdBallotOneResult.logs[0].args.ballotId.toNumber();

            const questionBallotTwo = "Do you agree?";
            const optionsBallotTwo = ["Yes", "No", "Maybe"];
            const endTimeBallotTwo = (await time.latest()) + time.duration.days(1);

            const createdBallotTwoResult = await contractInstance.createBallot(questionBallotTwo, optionsBallotTwo, 
                endTimeBallotTwo, { from : owner });
            const ballotTwoId = createdBallotTwoResult.logs[0].args.ballotId.toNumber();


            await contractInstance.vote(ballotOneId, 1, { from: owner });
            await contractInstance.vote(ballotOneId, 1, { from: alice });
            await contractInstance.vote(ballotOneId, 0, { from: bob });

            await contractInstance.vote(ballotTwoId, 0, { from: owner });

            await time.increase(time.duration.days(1));

            const closedBallots = await contractInstance.getClosedBallots({ from : owner });

            assert.isArray(closedBallots);
            assert.equal(closedBallots[0].ballotId, ballotOneId);
            assert.equal(closedBallots[0].question, questionBallotOne);
            assert.equal(closedBallots[0].winningOption, "No");
            assert.equal(closedBallots[0].winningVotesNumber, 2);
            assert.equal(closedBallots[0].allVotesNumber, 3);
            assert.equal(closedBallots[0].allVoteCounts[0], 1);
            assert.equal(closedBallots[0].allVoteCounts[1], 2);
            assert.equal(closedBallots[0].allVoteCounts[2], 0);

            assert.equal(closedBallots[1].ballotId, ballotTwoId);
            assert.equal(closedBallots[1].question, questionBallotTwo);
            assert.equal(closedBallots[1].winningOption, "Yes");
            assert.equal(closedBallots[1].winningVotesNumber, 1);
            assert.equal(closedBallots[1].allVotesNumber, 1);
            assert.equal(closedBallots[1].allVoteCounts[0], 1);
            assert.equal(closedBallots[1].allVoteCounts[1], 0);
            assert.equal(closedBallots[1].allVoteCounts[2], 0);
        })
    })
})