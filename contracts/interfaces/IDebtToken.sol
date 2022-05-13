// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../utils/ProtocolControllerStructs.sol";
import "../utils/Math.sol";

interface IDebtToken {
    function borrow(uint256 amount) external;

    function repay(uint256 amount) external;

    function redeem(uint256 amount) external;

    function liquidate(
        address borrower,
        IDebtToken collateralToken,
        uint256 repayAmount
    ) external;

    function seize(
        address debtToken,
        address borrower,
        address liquidator,
        uint256 repayAmount
    ) external;

    function getAccountSnapshot(address account)
        external
        view
        returns (uint256 borrowedTokens, uint256 collateralizedTokens);
}
