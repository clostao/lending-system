// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IDebtToken.sol";
import "./interfaces/IProtocolController.sol";
import "./interfaces/IPriceOracle.sol";
import "./utils/ProtocolControllerStructs.sol";
import "./utils/Error.sol";
import "./DebtToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract ProtocolController is IProtocolController, Ownable {
    struct MarketInfo {
        bool isListed;
        Math.Factor collateralFactor;
        address underlyingAsset;
        mapping(address => bool) accountMembership;
    }

    mapping(address => MarketInfo) public availableMarkets;

    address[] public marketAddresses;

    IPriceOracle public priceOracle;

    // constructor

    constructor(address _priceOracle) {
        priceOracle = IPriceOracle(_priceOracle);
    }

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
        marketAddresses.push(marketAddress);
        console.log(
            "Added market with %s into protocol controller.",
            marketAddress
        );
    }

    // Helpers

    function calculateAmountOfCollateral(
        address debtToken,
        uint256 amountToBeRepayed,
        address collateralToken
    ) public view returns (uint256) {
        Math.Factor memory debtPrice = priceOracle.getPrice(debtToken);

        Math.Factor memory collateralPrice = priceOracle.getPrice(
            collateralToken
        );

        return
            Math.applyInversedFactor(
                Math.applyFactor(amountToBeRepayed, debtPrice),
                collateralPrice
            );
    }

    function calculateRepayAmount(
        address account,
        address debtToken,
        address collateralToken,
        Math.Factor memory targetFactor
    ) public view returns (bool, uint256) {
        (uint256 borrowedDebtTokens, uint256 collateralDebtTokens) = IDebtToken(
            debtToken
        ).getAccountSnapshot(account);
        console.log(
            "Debt token: %d %d",
            borrowedDebtTokens,
            collateralDebtTokens
        );
        if (borrowedDebtTokens < collateralDebtTokens) {
            return (false, 0);
        }

        (
            uint256 borrowedRepayTokens,
            uint256 collateralRepayTokens
        ) = IDebtToken(collateralToken).getAccountSnapshot(account);
        console.log(
            "Collateral token: %d %d",
            borrowedRepayTokens,
            collateralRepayTokens
        );
        if (collateralRepayTokens < borrowedRepayTokens) {
            return (false, 0);
        }

        borrowedDebtTokens -= collateralDebtTokens;
        collateralRepayTokens -= borrowedRepayTokens;

        console.log("Net borrowed: %d", borrowedDebtTokens);
        console.log("Net collateral: %d", collateralRepayTokens);

        Math.Factor memory liquidatorRate = DebtToken(collateralToken)
            .getLiquidatorRate();
        Math.Factor memory collateralFactor = availableMarkets[debtToken]
            .collateralFactor;

        uint256 numerator = Math.applyFactor(borrowedDebtTokens, targetFactor) -
            Math.applyFactor(collateralRepayTokens, collateralFactor);
        uint256 denominator = targetFactor.numerator -
            Math.applyFactor(
                Math.applyFactor(targetFactor.denominator, collateralFactor),
                liquidatorRate
            );

        return (true, numerator / denominator);
    }

    function getExpectedLiquidity(
        address account,
        IDebtToken tokenToBeModified,
        uint256 toBeRedeemed,
        uint256 toBeBorrowed
    ) public view returns (bool, uint256) {
        console.log("Entry");
        ProtocolControllerStructs.AccountLiquidity memory vars;
        for (uint256 i = 0; i < marketAddresses.length; i++) {
            vars.token = marketAddresses[i];
            console.log("Data from %s", vars.token);
            console.log("Entry: %d", i);
            (
                vars.borrowedTokenBalance,
                vars.collateralizedTokenAmount
            ) = IDebtToken(vars.token).getAccountSnapshot(account);
            console.log(
                "Balances: %d | %d",
                vars.borrowedTokenBalance,
                vars.collateralizedTokenAmount
            );

            console.log("Collateralized: %d", vars.collateralizedTokenAmount);
            vars.tokenPriceFactor = priceOracle.getPrice(marketAddresses[i]);
            vars.collateralFactor = availableMarkets[marketAddresses[i]]
                .collateralFactor;

            console.log(
                "Price: %d / %d",
                vars.tokenPriceFactor.numerator,
                vars.tokenPriceFactor.denominator
            );
            console.log("Borrowed: %d", vars.borrowedTokenBalance);
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

            console.log("Collateral: %d", vars.collateralizedTokenAmount);

            if (address(tokenToBeModified) == vars.token) {
                console.log(
                    "pre: Total borrow balance %d",
                    vars.totalBorrowedBalance
                );

                vars.totalBorrowedBalance += Math.applyFactor(
                    Math.applyFactor(toBeRedeemed, vars.collateralFactor),
                    vars.tokenPriceFactor
                );

                vars.totalBorrowedBalance += Math.applyFactor(
                    toBeBorrowed,
                    vars.tokenPriceFactor
                );

                console.log(
                    "post: Total borrow balance %d",
                    vars.totalBorrowedBalance
                );
            }
            console.log("Out: %d", i);
        }

        console.log("Total collateral: %d", vars.totalCollateralizedAmount);
        console.log("Total borrowed: %d", vars.totalBorrowedBalance);
        if (vars.totalBorrowedBalance <= vars.totalCollateralizedAmount) {
            return (
                true,
                vars.totalCollateralizedAmount - vars.totalBorrowedBalance
            );
        } else {
            return (
                false,
                vars.totalBorrowedBalance - vars.totalCollateralizedAmount
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
    ) external override returns (uint8) {
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
    ) external view override returns (uint8) {
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
    ) external view override returns (uint8) {
        if (!availableMarkets[debtToken].isListed) {
            return Errors.MARKET_NOT_LISTED;
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
    ) external view override returns (uint8) {
        if (!availableMarkets[debtToken].isListed) {
            return Errors.MARKET_NOT_LISTED;
        }
        amount;
        account;
        return Errors.NO_ERROR;
    }

    function allowSeize(
        address debtToken,
        IDebtToken seizedToken,
        address borrower,
        address liquidator,
        uint256 repayAmount
    ) external view override returns (uint8) {
        uint8 code = checkUserIsInMarket(debtToken, borrower);
        if (code != 0) {
            return code;
        }
        code = checkUserIsInMarket(address(seizedToken), borrower);
        if (code != 0) {
            return code;
        }
        liquidator;
        repayAmount;
        return Errors.NO_ERROR;
    }

    function allowLiquidate(
        address debtToken,
        IDebtToken seizedToken,
        address borrower,
        address liquidator,
        uint256 repayAmount,
        Math.Factor memory liquidatorRate
    ) external view override returns (uint8) {
        uint8 code = checkUserIsInMarket(debtToken, borrower);
        if (code != 0) {
            return code;
        }
        if (!availableMarkets[address(seizedToken)].isListed) {
            return Errors.COLLATERAL_IS_NOT_LISTED;
        }
        (bool isNowSolvent, ) = getExpectedLiquidity(
            borrower,
            IDebtToken(address(0)),
            0,
            0
        );
        if (isNowSolvent) {
            return Errors.USER_IS_SOLVENT;
        }
        liquidator;
        repayAmount;
        liquidatorRate;
        return Errors.NO_ERROR;
    }
}
