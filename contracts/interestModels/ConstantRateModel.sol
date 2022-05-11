// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/IInterestModel.sol";
import "../utils/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ConstantRateModel is IInterestRateModel, Ownable {
    Math.Factor public blockRate;

    constructor(uint256 _blockRateNumerator, uint256 _blockRateDenominator) {
        blockRate = Math.Factor(_blockRateNumerator, _blockRateDenominator);
    }

    function calculateBorrowerInterestRate(
        uint256 totalSupplied,
        uint256 //_totalBorrowed
    ) external view override returns (Math.Factor memory) {
        if (totalSupplied == 0) {
            return Math.Factor(0, 1);
        }
        return Math.Factor(blockRate.numerator, blockRate.denominator);
    }

    function setBlockRate(
        uint256 _blockRateNumerator,
        uint256 _blockRateDenominator
    ) external onlyOwner {
        blockRate = Math.Factor(_blockRateNumerator, _blockRateDenominator);
    }
}
