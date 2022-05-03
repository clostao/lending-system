// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IInterestRateModel {
    function calculateBorrowerInterestRate(
        uint256 totalSupplied,
        uint256 totalBorrowed
    ) external view returns (uint256);
}
