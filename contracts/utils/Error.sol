// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Errors {
    uint8 public constant NO_ERROR = 0;
    uint8 public constant MARKET_NOT_LISTED = 1;
    uint8 public constant ACCOUNT_NOT_LISTED = 2;
    uint8 public constant NOT_ENOUGH_BALANCE = 3;
    uint8 public constant USER_WONT_BE_SOLVENT = 4;
    uint8 public constant USER_IS_SOLVENT = 5;
    uint8 public constant COLLATERAL_IS_NOT_LISTED = 6;
}
