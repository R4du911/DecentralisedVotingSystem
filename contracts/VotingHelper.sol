// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BallotFactory.sol";

contract VotingHelper is BallotFactory {

    modifier isOpenBallot(uint _ballotId) {
        require(_ballotId < ballots.length);
        require(block.timestamp >= ballots[_ballotId].startTime);
        require(block.timestamp <= ballots[_ballotId].startTime + ballots[_ballotId].duration);
        _;
    }
}