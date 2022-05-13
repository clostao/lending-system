// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/IDebtToken.sol";

interface IProtocolController {
    function allowBorrow(
        address debtToken,
        address user,
        uint256 amount
    ) external returns (uint8);

    function allowRepay(
        address debtToken,
        address user,
        uint256 amount
    ) external returns (uint8);

    function allowMint(
        address debtToken,
        address user,
        uint256 amount
    ) external returns (uint8);

    function allowRedeem(
        address debtToken,
        address user,
        uint256 amount
    ) external returns (uint8);

    function allowLiquidate(
        address debtToken,
        IDebtToken seizedToken,
        address borrower,
        address liquidator,
        uint256 repayAmount,
        Math.Factor memory liquidatorRate
    ) external returns (uint8);

    function allowSeize(
        address debtToken,
        IDebtToken seizedToken,
        address borrower,
        address liquidator,
        uint256 repayAmount
    ) external returns (uint8);
}
