//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IDebtToken.sol";
import "./ProtocolController.sol";
import "./interfaces/IInterestModel.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract DebtToken is IDebtToken, ERC20, Ownable {
    struct AccountSnapshot {
        uint256 borrowedTokens;
        Math.Factor entryExchangeRate;
        bool hasDebt;
    }

    IERC20 public underlyingAsset;
    ProtocolController public controller;

    Math.Factor public liquidatorRate = Math.Factor(103, 100);

    uint256 public lastInterestBlock;

    Math.Factor public exchangeRate;
    IInterestRateModel public interestRateModel;

    mapping(address => AccountSnapshot) public accountSnapshot;

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        address _underlyingAsset,
        address _controller,
        address _interestModel
    ) ERC20(tokenName, tokenSymbol) {
        underlyingAsset = IERC20(_underlyingAsset);
        controller = ProtocolController(_controller);
        interestRateModel = IInterestRateModel(_interestModel);
        lastInterestBlock = block.number;
        exchangeRate = Math.Factor(10**10, 10**5);
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
        controller = ProtocolController(_controller);
    }

    // Getters

    function getLiquidatorRate() public view returns (Math.Factor memory) {
        return liquidatorRate;
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

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        require(
            msg.sender == address(this),
            "Only internal dTokens transactions"
        );
        _transfer(from, to, amount);
        return true;
    }

    function transfer(address to, uint256 amount)
        public
        override
        returns (bool)
    {
        require(
            msg.sender == address(this),
            "Only internal dTokens transactions"
        );
        _transfer(msg.sender, to, amount);
        return true;
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
            code == Errors.NO_ERROR,
            string(
                abi.encodePacked(
                    "BORROW_NOT_ALLOWED: code=",
                    Strings.toString(code)
                )
            )
        );

        // Snapshot account
        accountSnapshot[msg.sender].borrowedTokens += amount;
        accountSnapshot[msg.sender].entryExchangeRate = exchangeRate;

        accountSnapshot[msg.sender].hasDebt = true;

        // Contract call is secure since the underlying asset is controlled by contract owner
        underlyingAsset.transfer(msg.sender, amount);
    }

    function repay(uint256 amount) external override {
        require(
            accumulateInterest() == Errors.NO_ERROR,
            "INTEREST_CALC_FAILED"
        );
        uint256 code = controller.allowRepay(address(this), msg.sender, amount);
        require(
            code == Errors.NO_ERROR,
            string(
                abi.encodePacked(
                    "REPAY_NOT_ALLOWED: code=",
                    Strings.toString(code)
                )
            )
        );

        uint256 priorBorrowed = normalizeDebtToCurrentExchangeRate(msg.sender);

        if (amount == type(uint256).max) {
            amount = priorBorrowed;
        }

        require(priorBorrowed >= amount, "REPAY_INVALID_AMOUNT");

        accountSnapshot[msg.sender].borrowedTokens = priorBorrowed - amount;
        accountSnapshot[msg.sender].entryExchangeRate = exchangeRate;

        underlyingAsset.transferFrom(msg.sender, address(this), amount);

        if (accountSnapshot[msg.sender].borrowedTokens == 0) {
            accountSnapshot[msg.sender].hasDebt = false;
        }
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
            code == Errors.NO_ERROR,
            string(
                abi.encodePacked(
                    "MINT_NOT_ALLOWED: code=",
                    Strings.toString(code)
                )
            )
        );

        _mint(msg.sender, Math.applyFactor(amount, exchangeRate));
        underlyingAsset.transferFrom(msg.sender, address(this), amount);
    }

    /*
     * @param {uint256 amount} Is the dToken amount that will be withdrawn from the contract
     */
    function redeem(uint256 amount) external override {
        require(
            accumulateInterest() == Errors.NO_ERROR,
            "INTEREST_CALC_FAILED"
        );
        if (amount == type(uint256).max) {
            amount = balanceOf(msg.sender);
        }
        uint256 underTokensAmount = Math.applyInversedFactor(
            amount,
            exchangeRate
        );
        uint256 code = controller.allowRedeem(
            address(this),
            msg.sender,
            underTokensAmount
        );
        require(
            code == Errors.NO_ERROR,
            string(
                abi.encodePacked(
                    "REDEEM_NOT_ALLOWED: code=",
                    Strings.toString(code)
                )
            )
        );

        console.log("Burning %d dTokens", amount);
        _burn(msg.sender, amount);

        console.log("Transferring %d actual tokens...", underTokensAmount);
        underlyingAsset.transfer(msg.sender, underTokensAmount);
    }

    function liquidate(
        address borrower,
        IDebtToken collateralToken,
        uint256 repayAmount
    ) external override {
        require(
            accumulateInterest() == Errors.NO_ERROR,
            "INTEREST_CALC_FAILED"
        );

        uint256 code = controller.allowLiquidate(
            address(this),
            collateralToken,
            borrower,
            msg.sender,
            repayAmount,
            liquidatorRate
        );

        require(
            code == Errors.NO_ERROR,
            string(
                abi.encodePacked(
                    "LIQUIDATE_NOT_ALLOWED: code=",
                    Strings.toString(code)
                )
            )
        );

        console.log("repay amount: %d", repayAmount);

        uint256 seizedAmount = controller.calculateAmountOfCollateral(
            address(this),
            repayAmount,
            address(collateralToken)
        );

        collateralToken.seize(
            address(this),
            borrower,
            msg.sender,
            seizedAmount
        );

        console.log("seized amount: %d", seizedAmount);

        uint256 underlyingTokens = Math.applyInversedFactor(
            repayAmount,
            exchangeRate
        );

        underlyingAsset.transferFrom(
            msg.sender,
            address(this),
            underlyingTokens
        );

        uint256 normalizedDebt = normalizeDebtToCurrentExchangeRate(borrower);

        console.log("normamlizeDebt: %s", normalizedDebt);
        console.log("underlyingTokens: %s", underlyingTokens);

        accountSnapshot[borrower].borrowedTokens =
            normalizedDebt -
            underlyingTokens;
        console.log("New debt: %s", accountSnapshot[borrower].borrowedTokens);
        accountSnapshot[borrower].entryExchangeRate = exchangeRate;
    }

    function seize(
        address debtToken,
        address borrower,
        address liquidator,
        uint256 repayAmount
    ) external override {
        uint256 code = controller.allowSeize(
            address(this),
            IDebtToken(debtToken),
            borrower,
            liquidator,
            repayAmount
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

        console.log("repay amount: %d", repayAmount);
        console.log(
            "Liquidator rate: %d / %d",
            liquidatorRate.numerator,
            liquidatorRate.denominator
        );
        uint256 liquidatorBounty = Math.applyFactor(
            repayAmount,
            liquidatorRate
        );

        // Own contract call for transferring funds
        DebtToken(this).transferFrom(borrower, liquidator, liquidatorBounty);
    }

    // Interest model

    function accumulateInterest() internal returns (uint256) {
        uint256 blocksDiff = block.number - lastInterestBlock;
        if (blocksDiff == 0) {
            return Errors.NO_ERROR;
        }

        uint256 actualTotalSupplied = Math.applyInversedFactor(
            totalSupply(),
            exchangeRate
        );

        uint256 notBorrowedAmount = underlyingAsset.balanceOf(address(this));

        uint256 borrowedAmount = actualTotalSupplied - notBorrowedAmount;

        console.log("-----");
        console.log("----- Borrowed");
        console.log(borrowedAmount);
        console.log("----- Supplied");
        console.log(actualTotalSupplied);
        console.log("----- ");

        if (borrowedAmount == 0) {
            return Errors.NO_ERROR;
        }

        Math.Factor memory accumulatedInterestByBlock = interestRateModel
            .calculateBorrowerInterestRate(actualTotalSupplied, borrowedAmount);

        Math.Factor memory accumulatedInterest = Math.Factor(
            accumulatedInterestByBlock.numerator * blocksDiff,
            accumulatedInterestByBlock.denominator
        );

        uint256 totalInterest = Math.applyFactor(
            borrowedAmount,
            accumulatedInterest
        );

        exchangeRate.denominator = Math.applyFactor(
            exchangeRate.denominator,
            Math.Factor(
                exchangeRate.denominator + totalInterest,
                exchangeRate.denominator
            )
        );

        return Errors.NO_ERROR;
    }

    function sumInterest(uint256 accumulatedInterest)
        external
        onlyOwner
        returns (uint256)
    {
        exchangeRate.denominator = Math.applyFactor(
            exchangeRate.denominator,
            Math.Factor(
                exchangeRate.denominator + accumulatedInterest,
                exchangeRate.denominator
            )
        );

        return Errors.NO_ERROR;
    }

    // Users debt method

    function normalizeDebtToCurrentExchangeRate(address account)
        public
        view
        returns (uint256)
    {
        if (!accountSnapshot[account].hasDebt) {
            return 0;
        }
        uint256 borrowed = accountSnapshot[account].borrowedTokens;
        Math.Factor memory initialRate = accountSnapshot[account]
            .entryExchangeRate;

        // borrowed * currentRate / initialRate;
        return
            Math.applyInversedFactor(
                Math.applyFactor(borrowed, initialRate),
                exchangeRate
            );
    }

    function getAccountSnapshot(address account)
        public
        view
        override
        returns (uint256 borrowedTokens, uint256 collateralizedTokens)
    {
        return (
            normalizeDebtToCurrentExchangeRate(account),
            Math.applyInversedFactor(balanceOf(account), exchangeRate)
        );
    }
}
