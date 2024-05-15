// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BallotFactory is Ownable {
    event NewBallot(uint ballotId, string question, string[] options, uint endTime);

    struct Ballot {
        string question;
        string[] options;
        uint endTime;
        mapping(uint => uint) voteCounts;
        mapping(address => bool) hasVoted;
    }

    Ballot[] public ballots;

    function createBallot(string memory _question, string[] memory _options, uint _endTime) external onlyOwner {
        require(_options.length > 1);
        require(_endTime > block.timestamp + 1000);

        Ballot storage newBallot = ballots.push();
        newBallot.question = _question;
        newBallot.options = _options;
        newBallot.endTime = _endTime;

        emit NewBallot(ballots.length - 1, _question, _options, _endTime);
    }
}