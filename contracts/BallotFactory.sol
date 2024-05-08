// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0

import "@openzeppelin/contracts/access/Ownable.sol";

contract BallotFactory is Ownable {

    event NewBallot(uint ballotId, string question, string[] options, uint startTime, uint duration);

    struct Ballot {
        string question;
        string[] options;
        uint startTime;
        uint duration;
        mapping(uint => uint) voteCounts;
        mapping(address => bool) hasVoted;
    }

    Ballot[] public ballots;

    function createBallot(string calldata _question, string[] calldata _options, uint _startTime, uint _duration) external onlyOwner {
        uint id = ballots.push(Ballot(_question, _options, _startTime, _duration));
        emit NewBallot(id, _question, _options, _startTime, _duration);
    }
}