// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Error.sol";

library Math {
    struct Factor {
        uint256 numerator;
        uint256 denominator;
    }

    function applyFactor(uint256 amount, Factor memory factor)
        public
        pure
        returns (uint256 result)
    {
        require(factor.denominator != 0, "DIVISION_BY_ZERO");
        return (amount * factor.numerator) / factor.denominator;
    }

    function applyInversedFactor(uint256 amount, Factor memory factor)
        public
        pure
        returns (uint256 result)
    {
        require(factor.numerator != 0, "DIVISION_BY_ZERO");
        return (amount * factor.denominator) / factor.numerator;
    }
}
