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

    function sumFactors(Math.Factor memory factor1, Math.Factor memory factor2)
        public
        pure
        returns (Math.Factor memory)
    {
        return
            Math.Factor(
                factor1.numerator *
                    factor2.denominator +
                    factor1.denominator *
                    factor2.numerator,
                factor1.denominator * factor2.denominator
            );
    }

    function subFactors(Math.Factor memory factor1, Math.Factor memory factor2)
        public
        pure
        returns (Math.Factor memory)
    {
        return
            Math.Factor(
                factor1.numerator *
                    factor2.denominator -
                    factor1.denominator *
                    factor2.numerator,
                factor1.denominator * factor2.denominator
            );
    }

    function inverseFactor(Math.Factor memory factor1)
        public
        pure
        returns (Math.Factor memory)
    {
        return Math.Factor(factor1.denominator, factor1.numerator);
    }
}
