// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OngoingBallots.sol";

contract UpcomingBallots is OngoingBallots {
    struct UpcomingBallot {
        string question;
        string[] options;
        uint ballotId;
        uint startTime;
    }

    function getUpcomingBallots() external view returns (UpcomingBallot[] memory) {
        uint count = 0;
        for (uint index = 0; index < ballots.length; index++) {
            if (isBallotUpcoming(index)) {
                count++;
            }
        }

        UpcomingBallot[] memory upcomingBallots = new UpcomingBallot[](count);
        uint upcomingBallotIndex = 0;

        for (uint allBallotsIndex = 0; allBallotsIndex < ballots.length; allBallotsIndex++) {
            if (isBallotUpcoming(allBallotsIndex)) {
                UpcomingBallot memory upcomingBallot = UpcomingBallot({
                    question: ballots[allBallotsIndex].question,
                    options: ballots[allBallotsIndex].options,
                    ballotId: allBallotsIndex,
                    startTime: ballots[allBallotsIndex].startTime
                });

                upcomingBallots[upcomingBallotIndex] = upcomingBallot;
                upcomingBallotIndex++;
            }
        }

        return upcomingBallots;
    }
}