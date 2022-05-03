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
        address user,
        address borrower,
        uint256 repayAmount,
        IDebtToken collateralToken
    ) external returns (uint8);

    function allowSeize(
        address debtToken,
        address user,
        address borrower,
        uint256 repayAmount,
        IDebtToken collateralToken
    ) external returns (uint8);
}
