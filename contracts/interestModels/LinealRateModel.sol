// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/IInterestModel.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LinealRateModel is IInterestRateModel, Ownable {
    Math.Factor public blockRate;

    constructor(uint256 _blockRateNumerator, uint256 _blockRateDenominator) {
        blockRate = Math.Factor(_blockRateNumerator, _blockRateDenominator);
    }

    function calculateBorrowerInterestRate(
        uint256 _totalSupplied,
        uint256 _totalBorrowed
    ) external view override returns (Math.Factor memory) {
        if (_totalSupplied == 0) {
            return Math.Factor(0, 1);
        }
        return
            Math.Factor(
                blockRate.numerator * _totalBorrowed,
                blockRate.denominator * _totalSupplied
            );
    }

    function setBlockRate(
        uint256 _blockRateNumerator,
        uint256 _blockRateDenominator
    ) external onlyOwner {
        blockRate = Math.Factor(_blockRateNumerator, _blockRateDenominator);
    }
}
