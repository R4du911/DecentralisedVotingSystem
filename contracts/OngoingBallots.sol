// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VotingHelper.sol";

contract OngoingBallots is VotingHelper{

    event ReturnOngoingBallots(OngoingBallot[] ongoingBallots);

    struct OngoingBallot {
        string question;
        string[] options;
        uint startTime;
        uint endTime;
    }

    function getOngoingBallots() external view {
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
                    startTime: ballots[allBallotsIndex].startTime,
                    endTime: ballots[allBallotsIndex].endTime
                });

                ongoingBallots[ongoingBallotIndex] = ongoingBallot;
                ongoingBallotIndex++;
            }
        }

        emit ReturnOngoingBallots(ongoingBallots);
    }
}