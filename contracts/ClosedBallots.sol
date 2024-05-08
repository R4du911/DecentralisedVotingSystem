// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VotingHelper.sol";

contract ClosedBallots is VotingHelper{

    event ReturnClosedBallots(BallotResult[] closedBallotsResults);

    struct BallotResult {
        string question;
        string winningOption;
        uint winningVotesNumber;
        uint allVotesNumber;
        uint[] allVoteCounts;
    }

    function getBallotResult(uint _ballotId) private returns (BallotResult memory) {
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
            winningVotesNumber: highestVotes,
            allVotesNumber: allVotesNumber,
            allVoteCounts: voteCounts
        });
    }

    function getClosedBallots() external view {
        uint count = 0;
        for (uint index = 0; index < ballots.length; index++) {
            if (!isBallotOngoing(index)) {
                count++;
            }
        }

        BallotResult[] memory closedBallotsResults = new BallotResult[](count);
        uint closedBallotIndex = 0;

        for (uint allBallotsIndex = 0; allBallotsIndex < ballots.length; allBallotsIndex++) {
            if (!isBallotOngoing(allBallotsIndex)) {
                closedBallotsResults[closedBallotIndex] = getBallotResult(allBallotsIndex);
                closedBallotIndex++;
            }
        }

        emit ReturnClosedBallots(closedBallotsResults);
    }
}