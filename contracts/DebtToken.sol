//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IDebtToken.sol";
import "./interfaces/IProtocolController.sol";
import "./interfaces/IInterestModel.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DebtToken is IDebtToken, ERC20, Ownable {
    struct AccountSnapshot {
        uint256 borrowedTokens;
        Math.Factor entryExchangeRate;
    }

    IERC20 public underlyingAsset;
    IProtocolController public controller;

    Math.Factor public liquidatorRate = Math.Factor(99, 100);

    uint256 private lastInterestBlock;

    Math.Factor private exchangeRate;
    IInterestRateModel private interestRateModel;

    mapping(address => AccountSnapshot) public accountSnapshot;

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        address _underlyingAsset,
        address _controller,
        address _interestModel
    ) ERC20(tokenName, tokenSymbol) {
        underlyingAsset = IERC20(_underlyingAsset);
        controller = IProtocolController(_controller);
        interestRateModel = IInterestRateModel(_interestModel);
        lastInterestBlock = block.number;
        exchangeRate = Math.Factor(10**21, 10);
    }

    // Configuration

    function updateInterestRateModel(address _interestRateModel)
        external
        onlyOwner
    {
        interestRateModel = IInterestRateModel(_interestRateModel);
    }

    function updateLiquidatorRate(uint256 numerator, uint256 denominator)
        external
        onlyOwner
    {
        liquidatorRate = Math.Factor(numerator, denominator);
    }

    function updateController(address _controller) external onlyOwner {
        controller = IProtocolController(_controller);
    }

    // ERC20 Methods

    function allowance(address owner, address spender)
        public
        view
        override
        returns (uint256)
    {
        if (msg.sender == address(this)) {
            return type(uint256).max;
        }
        return super.allowance(owner, spender);
    }

    // Lending system main operations

    function borrow(uint256 amount) external override {
        require(
            accumulateInterest() == Errors.NO_ERROR,
            "INTEREST_CALC_FAILED"
        );
        uint256 code = controller.allowBorrow(
            address(this),
            msg.sender,
            amount
        );
        require(
            code != Errors.NO_ERROR,
            string(
                abi.encodePacked(
                    "BORROW_NOT_ALLOWED: code=",
                    Strings.toString(code)
                )
            )
        );

        // Snapshot account
        accountSnapshot[msg.sender].borrowedTokens = amount;
        accountSnapshot[msg.sender].entryExchangeRate = exchangeRate;

        // Contract call is secure since the underlying asset is controlled by contract owner
        underlyingAsset.transfer(msg.sender, amount);
    }

    function repay(uint256 amount) external  override {
        require(
            accumulateInterest() == Errors.NO_ERROR,
            "INTEREST_CALC_FAILED"
        );
        uint256 code = controller.allowRepay(address(this), msg.sender, amount);
        require(
            code != Errors.NO_ERROR,
            string(
                abi.encodePacked(
                    "REPAY_NOT_ALLOWED: code=",
                    Strings.toString(code)
                )
            )
        );

        uint256 priorBorrowed = normalizeDebtToCurrentExchangeRate(msg.sender);

        require(priorBorrowed >= amount, "REPAY_INVALID_AMOUNT");

        accountSnapshot[msg.sender].borrowedTokens = priorBorrowed - amount;
        accountSnapshot[msg.sender].entryExchangeRate = exchangeRate;
    }

    /*
     * @param {uint256 amount} Is the underlying token amount that will be deposited in the contract
     * @description The method will exchange, using the current exchange rate, the underlying tokens
     *              with the debt tokens.
     */
    function mint(uint256 amount) external {
        require(
            accumulateInterest() == Errors.NO_ERROR,
            "INTEREST_CALC_FAILED"
        );
        uint256 code = controller.allowMint(address(this), msg.sender, amount);
        require(
            code != Errors.NO_ERROR,
            string(
                abi.encodePacked(
                    "REPAY_NOT_ALLOWED: code=",
                    Strings.toString(code)
                )
            )
        );

        _mint(msg.sender, amount);
        underlyingAsset.transferFrom(
            msg.sender,
            address(this),
            Math.applyInversedFactor(amount, exchangeRate)
        );
    }

    /*
     * @param {uint256 amount}
     */
    function redeem(uint256 amount) external override {
        require(
            accumulateInterest() == Errors.NO_ERROR,
            "INTEREST_CALC_FAILED"
        );
        uint256 code = controller.allowRedeem(
            address(this),
            msg.sender,
            amount
        );
        require(
            code != Errors.NO_ERROR,
            string(
                abi.encodePacked(
                    "REDEEM_NOT_ALLOWED: code=",
                    Strings.toString(code)
                )
            )
        );

        _burn(msg.sender, amount);

        underlyingAsset.transfer(
            msg.sender,
            Math.applyFactor(amount, exchangeRate)
        );
    }

    function liquidate(
        address borrower,
        uint256 repayAmount,
        IDebtToken collateralToken
    ) external override {
        require(
            accumulateInterest() == Errors.NO_ERROR,
            "INTEREST_CALC_FAILED"
        );
        uint256 code = controller.allowLiquidate(
            address(this),
            msg.sender,
            borrower,
            repayAmount,
            collateralToken
        );
        require(
            code != Errors.NO_ERROR,
            string(
                abi.encodePacked(
                    "LIQUIDATE_NOT_ALLOWED: code=",
                    Strings.toString(code)
                )
            )
        );

        collateralToken.seize(
            borrower,
            msg.sender,
            repayAmount,
            collateralToken
        );
    }

    function seize(
        address borrower,
        address liquidator,
        uint256 amount,
        IDebtToken collateralToken
    ) external override {
        uint256 code = controller.allowSeize(
            address(this),
            borrower,
            liquidator,
            amount,
            collateralToken
        );
        require(
            code != Errors.NO_ERROR,
            string(
                abi.encodePacked(
                    "LIQUIDATE_NOT_ALLOWED: code=",
                    Strings.toString(code)
                )
            )
        );

        uint256 liquidatorBounty = amount -
            Math.applyFactor(amount, liquidatorRate);
        uint256 seizedTokens = amount - liquidatorBounty;

        // Own contract call for transferring funds
        DebtToken(this).transferFrom(borrower, liquidator, liquidatorBounty);
        DebtToken(this).transferFrom(borrower, address(this), seizedTokens);
    }

    // Interest model

    function accumulateInterest() internal returns (uint256) {
        uint256 blocksDiff = block.number - lastInterestBlock;
        if (blocksDiff == 0) {
            return Errors.NO_ERROR;
        }

        uint256 totalSupplied = Math.applyInversedFactor(
            totalSupply(),
            exchangeRate
        );

        uint256 notBorrowedAmount = underlyingAsset.balanceOf(address(this));

        uint256 accumulatedInterestByBlock = interestRateModel
            .calculateBorrowerInterestRate(
                totalSupplied,
                totalSupplied - notBorrowedAmount
            );

        uint256 accumulatedInterest = accumulatedInterestByBlock * blocksDiff;
        exchangeRate.numerator += accumulatedInterest;

        return Errors.NO_ERROR;
    }

    // Users debt method

    function normalizeDebtToCurrentExchangeRate(address account)
        public
        view
        returns (uint256)
    {
        uint256 borrowed = accountSnapshot[account].borrowedTokens;
        Math.Factor memory initialRate = accountSnapshot[account]
            .entryExchangeRate;

        // borrowed * currentRate / initialRate;
        return
            Math.applyInversedFactor(
                Math.applyFactor(borrowed, exchangeRate),
                initialRate
            );
    }

    function getAccountSnapshot(address account)
        public
        view 
        override
        returns (uint256 borrowedTokens, uint256 collateralizedTokens)
    {
        return (
            Math.applyFactor(balanceOf(account), exchangeRate),
            IERC20(underlyingAsset).balanceOf(account)
        );
    }
}
