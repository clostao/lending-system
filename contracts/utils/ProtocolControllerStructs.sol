// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IDebtToken.sol";
import "./Math.sol";

library ProtocolControllerStructs {
    struct AccountLiquidity {
        uint256 borrowedTokenBalance;
        uint256 collateralizedTokenAmount;
        uint256 totalBorrowedBalance;
        uint256 totalCollateralizedAmount;
        Math.Factor tokenPriceFactor;
        Math.Factor exchangeRate;
        Math.Factor collateralFactor;
        IERC20 underlyingAssetAddress;
        address token;
    }
    struct LiquidationInfo {
        uint256 borrowedDebtTokens;
        uint256 collateralDebtTokens;
        uint256 borrowedRepayTokens;
        uint256 collateralRepayTokens;
        Math.Factor liquidationRate;
        Math.Factor collateralFactor;
    }
}
