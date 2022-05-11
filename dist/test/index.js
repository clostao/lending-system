"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ethers_1 = require("ethers");
const hardhat_1 = require("hardhat");
describe("One market", function () {
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
    });
    it("Add market to protocol controller", async function () {
        const MintableToken = await hardhat_1.ethers.getContractFactory("MintableToken");
        const ConstantRateModel = await hardhat_1.ethers.getContractFactory("ConstantRateModel");
        const DebtToken = await hardhat_1.ethers.getContractFactory("DebtToken", {
            libraries: {
                Math: mathContract.address,
            },
        });
        const underToken = await MintableToken.deploy("TEST", "TST");
        const interestModel = await ConstantRateModel.deploy(0, 1);
        const debtToken = await DebtToken.deploy("Debt TEST Token", "dTST", underToken.address, protocolContract.address, interestModel.address);
        priceOracle.setPrice(debtToken.address, ethers_1.BigNumber.from(10).pow(18), 1);
        await protocolContract.addMarket(debtToken.address, 95, 100, underToken.address);
        (0, chai_1.expect)((await protocolContract.availableMarkets(debtToken.address)).isListed).to.be.true;
        (0, chai_1.expect)((await protocolContract.availableMarkets(debtToken.address)).underlyingAsset).to.be.equal(underToken.address);
        (0, chai_1.expect)((await protocolContract.availableMarkets(debtToken.address)).collateralFactor.numerator).to.be.equal(95);
        (0, chai_1.expect)((await protocolContract.availableMarkets(debtToken.address)).collateralFactor.denominator).to.be.equal(100);
    });
    it("Add market and check liquidity", async function () {
        const [signer] = await hardhat_1.ethers.getSigners();
        const MintableToken = await hardhat_1.ethers.getContractFactory("MintableToken");
        const ConstantRateModel = await hardhat_1.ethers.getContractFactory("ConstantRateModel");
        const DebtToken = await hardhat_1.ethers.getContractFactory("DebtToken", {
            libraries: {
                Math: mathContract.address,
            },
        });
        const underToken = await MintableToken.deploy("TEST", "TST");
        const interestModel = await ConstantRateModel.deploy(0, 1);
        const debtToken = await DebtToken.deploy("Debt TEST Token", "dTST", underToken.address, protocolContract.address, interestModel.address);
        await priceOracle.setPrice(debtToken.address, ethers_1.BigNumber.from(10).pow(18), 1);
        await protocolContract.addMarket(debtToken.address, 95, 100, underToken.address);
        const [solvent, balance] = await protocolContract.getExpectedLiquidity(signer.address, debtToken.address, 0, 0);
        (0, chai_1.expect)(solvent).to.be.true;
        (0, chai_1.expect)(balance.toNumber()).to.be.equal(0);
    });
    it("Add market, mint and check liquidity", async function () {
        const [signer] = await hardhat_1.ethers.getSigners();
        const MintableToken = await hardhat_1.ethers.getContractFactory("MintableToken");
        const ConstantRateModel = await hardhat_1.ethers.getContractFactory("ConstantRateModel");
        const DebtToken = await hardhat_1.ethers.getContractFactory("DebtToken", {
            libraries: {
                Math: mathContract.address,
            },
        });
        const underToken = await MintableToken.deploy("TEST", "TST");
        const interestModel = await ConstantRateModel.deploy(0, 1);
        const debtToken = await DebtToken.deploy("Debt TEST Token", "dTST", underToken.address, protocolContract.address, interestModel.address);
        await underToken.mint(signer.address, 1000000);
        await underToken.approve(debtToken.address, 1000000);
        await protocolContract.addMarket(debtToken.address, 95, 100, underToken.address);
        await debtToken.mint(1000000);
        await priceOracle.setPrice(debtToken.address, 2, 1);
        const [solvent, balance] = await protocolContract.getExpectedLiquidity(signer.address, debtToken.address, 0, 0);
        (0, chai_1.expect)(solvent).to.be.true;
        (0, chai_1.expect)(balance).to.be.equal(1900000);
    });
    it("Add market, mint and redeem", async function () {
        const [signer] = await hardhat_1.ethers.getSigners();
        const MintableToken = await hardhat_1.ethers.getContractFactory("MintableToken");
        const ConstantRateModel = await hardhat_1.ethers.getContractFactory("ConstantRateModel");
        const DebtToken = await hardhat_1.ethers.getContractFactory("DebtToken", {
            libraries: {
                Math: mathContract.address,
            },
        });
        const underToken = await MintableToken.deploy("TEST", "TST");
        const interestModel = await ConstantRateModel.deploy(0, 1);
        const debtToken = await DebtToken.deploy("Debt TEST Token", "dTST", underToken.address, protocolContract.address, interestModel.address);
        await underToken.mint(signer.address, 1000000);
        await underToken.approve(debtToken.address, 1000000);
        await protocolContract.addMarket(debtToken.address, 95, 100, underToken.address);
        await priceOracle.setPrice(debtToken.address, 2, 1);
        await debtToken.mint(1000000);
        (0, chai_1.expect)(await debtToken.balanceOf(signer.address)).to.be.equals(ethers_1.BigNumber.from(10).pow(11));
        (0, chai_1.expect)(await underToken.balanceOf(signer.address)).to.be.equal(0);
        await debtToken.redeem(await debtToken.balanceOf(signer.address));
        (0, chai_1.expect)(await underToken.balanceOf(signer.address)).to.be.equal(1000000);
    });
    it("Add market, mint and borrow", async function () {
        const [signer, liquidator] = await hardhat_1.ethers.getSigners();
        const MintableToken = await hardhat_1.ethers.getContractFactory("MintableToken");
        const ConstantRateModel = await hardhat_1.ethers.getContractFactory("ConstantRateModel");
        const DebtToken = await hardhat_1.ethers.getContractFactory("DebtToken", {
            libraries: {
                Math: mathContract.address,
            },
        });
        const underToken = await MintableToken.deploy("TEST", "TST");
        const interestModel = await ConstantRateModel.deploy(0, 1);
        const debtToken = await DebtToken.deploy("Debt TEST Token", "dTST", underToken.address, protocolContract.address, interestModel.address);
        await underToken.mint(signer.address, 1000000);
        await underToken.approve(debtToken.address, 1000000);
        await protocolContract.addMarket(debtToken.address, 95, 100, underToken.address);
        await priceOracle.setPrice(debtToken.address, 2, 1);
        await debtToken.mint(1000000);
        (0, chai_1.expect)(await underToken.balanceOf(signer.address)).to.be.equal(0);
        let [solvent, balance] = await protocolContract.getExpectedLiquidity(signer.address, debtToken.address, 0, 950000);
        (0, chai_1.expect)(solvent).to.be.equal(true);
        (0, chai_1.expect)(balance).to.be.equal(0);
        await debtToken.borrow(950000);
        let [borrowed] = await debtToken.getAccountSnapshot(signer.address);
        await debtToken.sumInterest(1);
        (0, chai_1.expect)(borrowed).to.be.equals(950000);
        (0, chai_1.expect)(await underToken.balanceOf(signer.address)).to.be.equal(950000);
        const [totalBorrowed, collateral] = await debtToken.getAccountSnapshot(signer.address);
        (0, chai_1.expect)(totalBorrowed).to.be.equals(ethers_1.BigNumber.from(950000).mul(100001).div(100000));
        (0, chai_1.expect)(collateral).to.be.equals(1000010);
        const allowed = await protocolContract.allowLiquidate(debtToken.address, signer.address, liquidator.address, 950000, debtToken.address);
        (0, chai_1.expect)(allowed).to.be.equal(5);
    });
});
