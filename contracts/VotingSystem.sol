// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OngoingBallots.sol";
import "./ClosedBallots.sol";
import "./VotingLogic.sol";

contract VotingSystem is VotingLogic, OngoingBallots, ClosedBallots{

}