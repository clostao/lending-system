// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IDebtToken.sol";
import "./interfaces/IProtocolController.sol";
import "./interfaces/IPriceOracle.sol";
import "./utils/ProtocolControllerStructs.sol";
import "./utils/Error.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProtocolController is IProtocolController, Ownable {
    struct MarketInfo {
        bool isListed;
        Math.Factor collateralFactor;
        address underlyingAsset;
        mapping(address => bool) accountMembership;
    }

    mapping(address => MarketInfo) public availableMarkets;

    mapping(address => address[]) public userActiveMarkets;

    IPriceOracle public priceOracle;

    // Only Owner methods

    function addMarket(
        address marketAddress,
        uint256 collateralFactorNumerator,
        uint256 collateralFactorDenominator,
        address underlyingAsset
    ) external onlyOwner {
        availableMarkets[marketAddress].collateralFactor = Math.Factor(
            collateralFactorNumerator,
            collateralFactorDenominator
        );
        availableMarkets[marketAddress].isListed = true;
        availableMarkets[marketAddress].underlyingAsset = underlyingAsset;
    }

    function removeMarket(address marketAddress) external onlyOwner {
        availableMarkets[marketAddress].isListed = false;
    }

    // Helpers

    function getExpectedLiquidity(
        address account,
        IDebtToken tokenToBeModified,
        uint256 toBeBorrowedAmount,
        uint256 toBeDepositedAmount
    ) public view returns (bool, uint256) {
        address[] memory accountMarkets = userActiveMarkets[account];

        ProtocolControllerStructs.AccountLiquidity memory vars;
        for (uint256 i = accountMarkets.length; i >= 0; i--) {
            vars.token = IDebtToken(accountMarkets[i]);
            vars.underlyingAssetAddress = IERC20(
                availableMarkets[accountMarkets[i]].underlyingAsset
            );
            (vars.borrowedTokenBalance, vars.collateralizedTokenAmount) = vars
                .token
                .getAccountSnapshot(account);

            vars.tokenPriceFactor = priceOracle.getPrice(address(vars.token));
            vars.collateralFactor = availableMarkets[accountMarkets[i]]
                .collateralFactor;

            vars.totalBorrowedBalance += Math.applyFactor(
                vars.borrowedTokenBalance,
                vars.tokenPriceFactor
            );

            vars.totalCollateralizedAmount += Math.applyFactor(
                Math.applyFactor(
                    vars.collateralizedTokenAmount,
                    vars.collateralFactor
                ),
                vars.tokenPriceFactor
            );

            if (address(tokenToBeModified) == address(vars.token)) {
                vars.totalBorrowedBalance += Math.applyFactor(
                    Math.applyFactor(toBeBorrowedAmount, vars.collateralFactor),
                    vars.tokenPriceFactor
                );

                vars.totalCollateralizedAmount += Math.applyFactor(
                    toBeDepositedAmount,
                    vars.tokenPriceFactor
                );
            }
        }

        if (vars.totalBorrowedBalance > vars.totalCollateralizedAmount) {
            return (
                true,
                vars.totalBorrowedBalance - vars.totalCollateralizedAmount
            );
        } else {
            return (
                false,
                vars.totalCollateralizedAmount - vars.totalBorrowedBalance
            );
        }
    }

    function checkUserIsInMarket(address debtToken, address account)
        internal
        view
        returns (uint8)
    {
        if (!availableMarkets[debtToken].isListed) {
            return Errors.MARKET_NOT_LISTED;
        }
        if (!availableMarkets[debtToken].accountMembership[account]) {
            return Errors.ACCOUNT_NOT_LISTED;
        }
        return Errors.NO_ERROR;
    }

    // User market controllers

    function addUserToMarket(address debtToken, address user) internal {
        availableMarkets[debtToken].accountMembership[user] = true;
    }

    // Operations controller methods

    function allowBorrow(
        address debtToken,
        address account,
        uint256 amount
    ) external returns (uint8) {
        uint8 code = checkUserIsInMarket(debtToken, account);
        if (code != 0) {
            addUserToMarket(debtToken, account);
            require(
                checkUserIsInMarket(debtToken, account) == Errors.NO_ERROR,
                "USER_NOT_ADDED_TO_MARKET"
            );
        }

        (bool isSolvent, ) = getExpectedLiquidity(
            account,
            IDebtToken(debtToken),
            amount,
            0
        );

        return isSolvent ? Errors.NO_ERROR : Errors.USER_WONT_BE_SOLVENT;
    }

    function allowRepay(
        address debtToken,
        address account,
        uint256 amount
    ) external view returns (uint8) {
        uint8 code = checkUserIsInMarket(debtToken, account);
        if (code != 0) {
            return code;
        }
        amount;
        return Errors.NO_ERROR;
    }

    function allowRedeem(
        address debtToken,
        address account,
        uint256 amount
    ) external view returns (uint8) {
        uint8 code = checkUserIsInMarket(debtToken, account);
        if (code != 0) {
            return code;
        }

        (bool wouldBeSolvent, ) = getExpectedLiquidity(
            account,
            IDebtToken(debtToken),
            amount,
            0
        );

        return wouldBeSolvent ? Errors.NO_ERROR : Errors.USER_WONT_BE_SOLVENT;
    }

    function allowMint(
        address debtToken,
        address account,
        uint256 amount
    ) external returns (uint8) {
        uint8 code = checkUserIsInMarket(debtToken, account);
        if (code != 0) {
            addUserToMarket(debtToken, account);
            require(
                checkUserIsInMarket(debtToken, account) == Errors.NO_ERROR,
                "USER_NOT_ADDED_TO_MARKET"
            );
        }
        amount;
        return Errors.NO_ERROR;
    }

    function allowSeize(
        address debtToken,
        address borrower,
        address liquidator,
        uint256 amount,
        IDebtToken collateralToken
    ) external view returns (uint8) {
        uint8 code = checkUserIsInMarket(debtToken, borrower);
        if (code != 0) {
            return code;
        }
        code = checkUserIsInMarket(address(collateralToken), borrower);
        if (code != 0) {
            return code;
        }
        liquidator;
        amount;
        return Errors.NO_ERROR;
    }

    function allowLiquidate(
        address debtToken,
        address borrower,
        address liquidator,
        uint256 amount,
        IDebtToken collateralToken
    ) external view returns (uint8) {
        uint8 code = checkUserIsInMarket(debtToken, borrower);
        if (code != 0) {
            return code;
        }
        if (!availableMarkets[address(collateralToken)].isListed) {
            return Errors.COLLATERAL_IS_NOT_LISTED;
        }
        (bool isNowSolvent, ) = getExpectedLiquidity(
            borrower,
            IDebtToken(address(0)),
            amount,
            0
        );
        if (isNowSolvent) {
            return Errors.USER_IS_SOLVENT;
        }
        (bool isThenSolvent, ) = getExpectedLiquidity(
            borrower,
            collateralToken,
            amount,
            0
        );
        liquidator;
        return isThenSolvent ? Errors.NO_ERROR : Errors.USER_WONT_BE_SOLVENT;
    }
}
