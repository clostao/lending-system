// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../utils/Math.sol";

interface IPriceOracle {
    function getPrice(address token) external view returns (Math.Factor memory);
}
