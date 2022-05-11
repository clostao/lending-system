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
        uint256 _totalSupplied,
        uint256 _totalBorrowed
    ) external view override returns (uint256) {
        if (_totalSupplied == 0) {
            return 0;
        }
        return ((blockRate * _totalBorrowed) / _totalSupplied);
    }

    function setBlockRate(uint256 _blockRate) external onlyOwner {
        blockRate = _blockRate;
    }
}
