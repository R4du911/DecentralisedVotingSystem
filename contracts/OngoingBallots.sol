// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ClosedBallots.sol";

contract OngoingBallots is ClosedBallots{
    struct OngoingBallot {
        string question;
        string[] options;
        uint ballotId;
        uint startTime;
        uint endTime;
        bool hasSenderVoted;
    }

    function getOngoingBallots() external view returns (OngoingBallot[] memory) {
        uint count = 0;
        for (uint index = 0; index < ballots.length; index++) {
            if (isBallotOngoing(index)) {
                count++;
            }
        }

        OngoingBallot[] memory ongoingBallots = new OngoingBallot[](count);
        uint ongoingBallotIndex = 0;

        for (uint allBallotsIndex = 0; allBallotsIndex < ballots.length; allBallotsIndex++) {
            if (isBallotOngoing(allBallotsIndex)) {
                OngoingBallot memory ongoingBallot = OngoingBallot({
                    question: ballots[allBallotsIndex].question,
                    options: ballots[allBallotsIndex].options,
                    ballotId: allBallotsIndex,
                    startTime: ballots[allBallotsIndex].startTime,
                    endTime: ballots[allBallotsIndex].endTime,
                    hasSenderVoted: ballots[allBallotsIndex].hasVoted[msg.sender]
                });

                ongoingBallots[ongoingBallotIndex] = ongoingBallot;
                ongoingBallotIndex++;
            }
        }

        return ongoingBallots;
    }
}