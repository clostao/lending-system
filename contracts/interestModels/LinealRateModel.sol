// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/IInterestModel.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LinealRateModel is IInterestRateModel, Ownable {
    uint256 public blockRate;

    constructor(uint256 _blockRate) {
        blockRate = _blockRate;
    }

    function calculateBorrowerInterestRate(
        uint256 totalSupplied,
        uint256 totalBorrowed
    ) external view override returns (uint256) {
        if (totalSupplied == 0) {return 0;}
        return (blockRate * totalBorrowed) / totalSupplied;
    }

    function setBlockRate(uint256 _blockRate) external onlyOwner {
        blockRate = _blockRate;
    }
}