// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OngoingBallots.sol";

contract VotingLogic is OngoingBallots{
    event Voted(uint ballotId, address voter, uint option);
    event BallotClosed(uint ballotId, uint winningOption);
    
    function vote(uint _ballotId, uint _option) external isOpenBallot(_ballotId) {
        require(!ballots[_ballotId].hasVoted[msg.sender]);
        require(_option < ballots[_ballotId].options.length);

        ballots[_ballotId].voteCounts[_option]++;
        ballots[_ballotId].hasVoted[msg.sender] = true;


        emit Voted(_ballotId, msg.sender, _option);
    }

    function closeBallot(uint _ballotId) external onlyOwner {
        require(_ballotId < ballots.length);
        require(block.timestamp < ballots[_ballotId].endTime);

        ballots[_ballotId].endTime = block.timestamp;

        uint winningVoteCount = 0;
        uint winningOption = 0;

        for (uint optionIndex = 0; optionIndex < ballots[_ballotId].options.length; optionIndex++) {
            if (ballots[_ballotId].voteCounts[optionIndex] > winningVoteCount) {
                winningVoteCount = ballots[_ballotId].voteCounts[optionIndex];
                winningOption = optionIndex;
            }
        }

        emit BallotClosed(_ballotId, winningOption);
    }
}