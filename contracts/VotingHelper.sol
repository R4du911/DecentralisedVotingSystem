// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BallotFactory.sol";

contract VotingHelper is BallotFactory {

    modifier isOpenBallot(uint _ballotId) {
        require(_ballotId < ballots.length);
        require(block.timestamp >= ballots[_ballotId].startTime);
        require(block.timestamp < ballots[_ballotId].endTime);
        _;
    }

    function isBallotOngoing(uint _ballotId) public view returns (bool) {
        require(_ballotId < ballots.length);
        return block.timestamp >= ballots[_ballotId].startTime &&
               block.timestamp < ballots[_ballotId].endTime;
    }
}