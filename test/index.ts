import { expect } from "chai";
import { BigNumber, constants } from "ethers";
import { ethers } from "hardhat";
import { ProtocolController, Math as SolMath, FixedPriceOracle, Errors, DebtToken, MintableToken } from "../typechain";

describe("One market", function () {
  let protocolContract: ProtocolController;
  let mathContract: SolMath;
  let priceOracle: FixedPriceOracle
  this.beforeEach(async () => {
    const MathFactory = await ethers.getContractFactory("Math")
    mathContract = await MathFactory.deploy()
    const PriceOracle = await ethers.getContractFactory("FixedPriceOracle")

    const ProtocolController = await ethers.getContractFactory(
      "ProtocolController",
      {
        libraries: {
          Math: mathContract.address,
        },
      }
    );
    priceOracle = await PriceOracle.deploy()
    protocolContract = await ProtocolController.deploy(priceOracle.address);
  })
  it("Add market to protocol controller", async function () {
    const MintableToken = await ethers.getContractFactory("MintableToken")
    const ConstantRateModel = await ethers.getContractFactory("ConstantRateModel")
    const DebtToken = await ethers.getContractFactory("DebtToken",
      {
        libraries: {
          Math: mathContract.address,
        },
      })
    const underToken = await MintableToken.deploy("TEST", "TST")
    const interestModel = await ConstantRateModel.deploy(0, 1)
    const debtToken = await DebtToken.deploy("Debt TEST Token", "dTST", underToken.address, protocolContract.address, interestModel.address)
    priceOracle.setPrice(debtToken.address, BigNumber.from(10).pow(18), 1)
    await protocolContract.addMarket(debtToken.address, 95, 100, underToken.address)
    expect((await protocolContract.availableMarkets(debtToken.address)).isListed).to.be.true
    expect((await protocolContract.availableMarkets(debtToken.address)).underlyingAsset).to.be.equal(underToken.address)
    expect((await protocolContract.availableMarkets(debtToken.address)).collateralFactor.numerator).to.be.equal(95)
    expect((await protocolContract.availableMarkets(debtToken.address)).collateralFactor.denominator).to.be.equal(100)
  })
  it("Add market and check liquidity", async function () {
    const [signer] = await ethers.getSigners()
    const MintableToken = await ethers.getContractFactory("MintableToken")
    const ConstantRateModel = await ethers.getContractFactory("ConstantRateModel")
    const DebtToken = await ethers.getContractFactory("DebtToken",
      {
        libraries: {
          Math: mathContract.address,
        },
      })
    const underToken = await MintableToken.deploy("TEST", "TST")
    const interestModel = await ConstantRateModel.deploy(0, 1)
    const debtToken = await DebtToken.deploy("Debt TEST Token", "dTST", underToken.address, protocolContract.address, interestModel.address)
    await priceOracle.setPrice(debtToken.address, BigNumber.from(10).pow(18), 1)
    await protocolContract.addMarket(debtToken.address, 95, 100, underToken.address)
    const [solvent, balance] = await protocolContract.getExpectedLiquidity(signer.address, debtToken.address, 0, 0)
    expect(solvent).to.be.true
    expect(balance.toNumber()).to.be.equal(0)
  })
  it("Add market, mint and check liquidity", async function () {
    const [signer] = await ethers.getSigners()
    const MintableToken = await ethers.getContractFactory("MintableToken")
    const ConstantRateModel = await ethers.getContractFactory("ConstantRateModel")
    const DebtToken = await ethers.getContractFactory("DebtToken",
      {
        libraries: {
          Math: mathContract.address,
        },
      })
    const underToken = await MintableToken.deploy("TEST", "TST")
    const interestModel = await ConstantRateModel.deploy(0, 1)
    const debtToken = await DebtToken.deploy("Debt TEST Token", "dTST", underToken.address, protocolContract.address, interestModel.address)
    await underToken.mint(signer.address, 1000000)
    await underToken.approve(debtToken.address, 1000000)
    await protocolContract.addMarket(debtToken.address, 95, 100, underToken.address)
    await debtToken.mint(1000000)
    await priceOracle.setPrice(debtToken.address, 2, 1)
    const [solvent, balance] = await protocolContract.getExpectedLiquidity(signer.address, debtToken.address, 0, 0)
    expect(solvent).to.be.true
    expect(balance).to.be.equal(1900000)
  })
  it("Add market, mint and redeem", async function () {
    const [signer] = await ethers.getSigners()
    const MintableToken = await ethers.getContractFactory("MintableToken")
    const ConstantRateModel = await ethers.getContractFactory("ConstantRateModel")
    const DebtToken = await ethers.getContractFactory("DebtToken",
      {
        libraries: {
          Math: mathContract.address,
        },
      })
    const underToken = await MintableToken.deploy("TEST", "TST")
    const interestModel = await ConstantRateModel.deploy(0, 1)
    const debtToken = await DebtToken.deploy("Debt TEST Token", "dTST", underToken.address, protocolContract.address, interestModel.address)
    await underToken.mint(signer.address, 1000000)
    await underToken.approve(debtToken.address, 1000000)
    await protocolContract.addMarket(debtToken.address, 95, 100, underToken.address)
    await priceOracle.setPrice(debtToken.address, 2, 1)
    await debtToken.mint(1000000)
    expect(await debtToken.balanceOf(signer.address)).to.be.equals(BigNumber.from(10).pow(11))
    expect(await underToken.balanceOf(signer.address)).to.be.equal(0)
    await debtToken.redeem(await debtToken.balanceOf(signer.address))
    expect(await underToken.balanceOf(signer.address)).to.be.equal(1000000)
  })
  it("Add market, mint and borrow", async function () {
    const [signer, liquidator] = await ethers.getSigners()
    const MintableToken = await ethers.getContractFactory("MintableToken")
    const ConstantRateModel = await ethers.getContractFactory("ConstantRateModel")
    const DebtToken = await ethers.getContractFactory("DebtToken",
      {
        libraries: {
          Math: mathContract.address,
        },
      })
    const underToken = await MintableToken.deploy("TEST", "TST")
    const interestModel = await ConstantRateModel.deploy(0, 1)
    const debtToken = await DebtToken.deploy("Debt TEST Token", "dTST", underToken.address, protocolContract.address, interestModel.address)
    await underToken.mint(signer.address, 1000000)
    await underToken.approve(debtToken.address, 1000000)
    await protocolContract.addMarket(debtToken.address, 95, 100, underToken.address)
    await priceOracle.setPrice(debtToken.address, 2, 1)
    await debtToken.mint(1000000)
    expect(await underToken.balanceOf(signer.address)).to.be.equal(0)
    let [solvent, balance] = await protocolContract.getExpectedLiquidity(signer.address, debtToken.address, 0, 950000)
    expect(solvent).to.be.equal(true)
    expect(balance).to.be.equal(0)
    await debtToken.borrow(950000)
    let [borrowed] = await debtToken.getAccountSnapshot(signer.address)
    await debtToken.sumInterest(1);
    expect(borrowed).to.be.equals(950000)
    expect(await underToken.balanceOf(signer.address)).to.be.equal(950000);
    const [totalBorrowed, collateral] = await debtToken.getAccountSnapshot(signer.address)
    expect(totalBorrowed).to.be.equals(BigNumber.from(950000).mul(100001).div(100000))
    expect(collateral).to.be.equals(1000010)
    const allowed = await protocolContract.allowLiquidate(debtToken.address, signer.address, liquidator.address, 950000, debtToken.address)
    expect(allowed).to.be.equal(5)
  })
  it("Add market, mint, borrow and repay", async function () {
    const [signer, liquidator] = await ethers.getSigners()
    const MintableToken = await ethers.getContractFactory("MintableToken")
    const ConstantRateModel = await ethers.getContractFactory("ConstantRateModel")
    const DebtToken = await ethers.getContractFactory("DebtToken",
      {
        libraries: {
          Math: mathContract.address,
        },
      })
    const underToken = await MintableToken.deploy("TEST", "TST")
    const interestModel = await ConstantRateModel.deploy(0, 1)
    const debtToken = await DebtToken.deploy("Debt TEST Token", "dTST", underToken.address, protocolContract.address, interestModel.address)
    await underToken.mint(signer.address, 1000000)
    await underToken.approve(debtToken.address, 1000000)
    await protocolContract.addMarket(debtToken.address, 95, 100, underToken.address)
    await priceOracle.setPrice(debtToken.address, 2, 1)
    await debtToken.mint(1000000)
    expect(await underToken.balanceOf(signer.address)).to.be.equal(0)
    let [solvent, balance] = await protocolContract.getExpectedLiquidity(signer.address, debtToken.address, 0, 950000)
    expect(solvent).to.be.equal(true)
    expect(balance).to.be.equal(0)
    await debtToken.borrow(950000)
    let [borrowed] = await debtToken.getAccountSnapshot(signer.address)
    await debtToken.sumInterest(1);
    expect(borrowed).to.be.equals(950000)
    expect(await underToken.balanceOf(signer.address)).to.be.equal(950000);
    let [totalBorrowed, collateral] = await debtToken.getAccountSnapshot(signer.address)
    expect(totalBorrowed).to.be.equals(BigNumber.from(950000).mul(100001).div(100000))
    expect(collateral).to.be.equals(1000010)
    await underToken.mint(signer.address, 1000010) // Mint more tokens for repaying loan
    await underToken.approve(debtToken.address, 1000010);// Approve allowance
    [borrowed] = await debtToken.getAccountSnapshot(signer.address)
    await debtToken.repay(borrowed); // Repay loan
    [borrowed, collateral] = await debtToken.getAccountSnapshot(signer.address)
    expect(borrowed).to.be.equal(0);
    expect(collateral).to.be.equal(1000010);
    await debtToken.redeem((await debtToken.balanceOf(signer.address)).mul(100000).div(100001).add(900000))
    expect(await underToken.balanceOf(signer.address)).to.be.equals(2000010)
    expect(await debtToken.balanceOf(signer.address)).to.be.equals(99991)
  })
});
