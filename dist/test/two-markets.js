"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ethers_1 = require("ethers");
const hardhat_1 = require("hardhat");
describe.only("Two markets", function () {
    let debtTokenOne;
    let debtTokenTwo;
    let underTokenOne;
    let underTokenTwo;
    let protocolContract;
    let mathContract;
    let priceOracle;
    this.beforeEach(async () => {
        const MathFactory = await hardhat_1.ethers.getContractFactory("Math");
        mathContract = await MathFactory.deploy();
        const PriceOracle = await hardhat_1.ethers.getContractFactory("FixedPriceOracle");
        const ProtocolController = await hardhat_1.ethers.getContractFactory("ProtocolController", {
            libraries: {
                Math: mathContract.address,
            },
        });
        priceOracle = await PriceOracle.deploy();
        protocolContract = await ProtocolController.deploy(priceOracle.address);
        const DebtToken = await hardhat_1.ethers.getContractFactory("DebtToken", {
            libraries: {
                Math: mathContract.address,
            },
        });
        const MintableToken = await hardhat_1.ethers.getContractFactory("MintableToken");
        const ConstantRateModel = await hardhat_1.ethers.getContractFactory("ConstantRateModel");
        const interestModel = await ConstantRateModel.deploy(0, 1);
        underTokenOne = await MintableToken.deploy("TEST 1", "TST1");
        underTokenTwo = await MintableToken.deploy("TEST 2", "TST2");
        debtTokenOne = await DebtToken.deploy("Debt TEST Token 1", "dTST1", underTokenOne.address, protocolContract.address, interestModel.address);
        debtTokenTwo = await DebtToken.deploy("Debt TEST Token 2", "dTST2", underTokenTwo.address, protocolContract.address, interestModel.address);
        await protocolContract.addMarket(debtTokenOne.address, 95, 100, underTokenOne.address);
        await protocolContract.addMarket(debtTokenTwo.address, 95, 100, underTokenTwo.address);
    });
    it("User deposit TST1 and TST2, check account liquidity", async function () {
        const [signer, liquidator] = await hardhat_1.ethers.getSigners();
        await underTokenOne.mint(signer.address, ethers_1.BigNumber.from(10).pow(6));
        await underTokenTwo.mint(signer.address, ethers_1.BigNumber.from(10).pow(6));
        await priceOracle.setPrice(debtTokenOne.address, 3, 1);
        await priceOracle.setPrice(debtTokenTwo.address, 4, 1);
        await underTokenOne.approve(debtTokenOne.address, ethers_1.BigNumber.from(10).pow(6));
        await underTokenTwo.approve(debtTokenTwo.address, ethers_1.BigNumber.from(10).pow(6));
        await debtTokenOne.mint(ethers_1.BigNumber.from(10).pow(6));
        await debtTokenTwo.mint(ethers_1.BigNumber.from(10).pow(6));
        const [solvent, balance] = await protocolContract.getExpectedLiquidity(signer.address, hardhat_1.ethers.constants.AddressZero, 0, 0);
        (0, chai_1.expect)(solvent).to.be.true;
        (0, chai_1.expect)(balance).to.be.equals(ethers_1.BigNumber.from(1000000).mul(7).mul(95).div(100));
    });
    it("User deposit TST1 and borrows TST2, then TST1 value falls drastically", async function () {
        const [signer, liquidator] = await hardhat_1.ethers.getSigners();
        await underTokenOne.mint(signer.address, ethers_1.BigNumber.from(10).pow(6));
        await priceOracle.setPrice(debtTokenOne.address, 10, 1);
        await priceOracle.setPrice(debtTokenTwo.address, 3, 1);
        const liquidatorUnderTokenOne = underTokenOne.connect(liquidator);
        const liquidatorDebtTokenTwo = debtTokenTwo.connect(liquidator);
        await liquidatorUnderTokenOne.mint(liquidator.address, ethers_1.BigNumber.from(10).pow(6));
        await liquidatorUnderTokenOne.approve(debtTokenTwo.address, ethers_1.BigNumber.from(10).pow(6));
        await liquidatorDebtTokenTwo.mint(ethers_1.BigNumber.from(10).pow(6));
        await underTokenOne.approve(debtTokenOne.address, ethers_1.BigNumber.from(10).pow(6));
        await underTokenTwo.approve(debtTokenTwo.address, ethers_1.BigNumber.from(10).pow(6));
        await debtTokenOne.mint(ethers_1.BigNumber.from(10).pow(6));
        await debtTokenTwo.borrow(ethers_1.BigNumber.from(10).pow(6));
    });
});
