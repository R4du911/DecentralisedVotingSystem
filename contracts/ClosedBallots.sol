// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VotingHelper.sol";

contract ClosedBallots is VotingHelper{
    struct BallotResult {
        string question;
        string winningOption;
        uint ballotId;
        uint winningVotesNumber;
        uint allVotesNumber;
        uint[] allVoteCounts;
    }

    function getBallotResult(uint _ballotId) public view returns (BallotResult memory) {
        require(_ballotId < ballots.length);
        require(!isBallotOngoing(_ballotId));

        uint winningOptionIndex = 0;
        uint highestVotes = 0;
        uint allVotesNumber = 0;
        uint[] memory voteCounts = new uint[](ballots[_ballotId].options.length);

        for (uint optionIndex = 0; optionIndex < ballots[_ballotId].options.length; optionIndex++) {
            uint count = ballots[_ballotId].voteCounts[optionIndex];
            allVotesNumber += count;
            voteCounts[optionIndex] = count;

            if (count > highestVotes) {
                winningOptionIndex = optionIndex;
                highestVotes = count;
            }
        }

        return BallotResult({
            question: ballots[_ballotId].question,
            winningOption: ballots[_ballotId].options[winningOptionIndex],
            ballotId: _ballotId,
            winningVotesNumber: highestVotes,
            allVotesNumber: allVotesNumber,
            allVoteCounts: voteCounts
        });
    }

    function getClosedBallots() external view returns (BallotResult[] memory) {
        uint count = 0;
        for (uint index = 0; index < ballots.length; index++) {
            if (!isBallotOngoing(index) && !(block.timestamp < ballots[index].startTime)) {
                count++;
            }
        }

        BallotResult[] memory closedBallotsResults = new BallotResult[](count);
        uint closedBallotIndex = 0;

        for (uint allBallotsIndex = 0; allBallotsIndex < ballots.length; allBallotsIndex++) {
            if (!isBallotOngoing(allBallotsIndex) && !(block.timestamp < ballots[allBallotsIndex].startTime)) {
                closedBallotsResults[closedBallotIndex] = getBallotResult(allBallotsIndex);
                closedBallotIndex++;
            }
        }

        return closedBallotsResults;
    }
}