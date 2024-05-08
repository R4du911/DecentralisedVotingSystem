// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0

import "@openzeppelin/contracts/access/Ownable.sol";

contract BallotFactory is Ownable {

    event NewBallot(uint ballotId, string question, string[] options, uint startTime, uint endTime);

    struct Ballot {
        string question;
        string[] options;
        uint startTime;
        uint endTime;
        mapping(uint => uint) voteCounts;
        mapping(address => bool) hasVoted;
    }

    Ballot[] public ballots;

    function createBallot(string memory _question, string[] memory _options, uint _startTime, uint _endTime) external onlyOwner {
        require(_options.length > 1);
        require(_startTime >= block.timestamp);
        require(_endTime > _startTime);

        Ballot memory newBallot = Ballot({
            question: _question,
            options: _options,
            startTime: _startTime,
            endTime: _endTime
        });
        ballots.push(newBallot);

        emit NewBallot(ballots.length - 1, _question, _options, _startTime, _endTime);
    }
}