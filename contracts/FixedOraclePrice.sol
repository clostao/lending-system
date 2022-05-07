// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IPriceOracle.sol";
import "./utils/Math.sol";

contract FixedPriceOracle is IPriceOracle {
    mapping(address => Math.Factor) public fixedPrices;

    function getPrice(address token)
        public
        view
        override
        returns (Math.Factor memory)
    {
        return fixedPrices[token];
    }

    function setPrice(
        address token,
        uint256 num,
        uint256 den
    ) external {
        fixedPrices[token] = Math.Factor(num, den);
    }
}
