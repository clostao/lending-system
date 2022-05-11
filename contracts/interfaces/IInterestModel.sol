// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../utils/Math.sol";

interface IInterestRateModel {
    function calculateBorrowerInterestRate(
        uint256 totalSupplied,
        uint256 totalBorrowed
    ) external returns (uint256);
}
