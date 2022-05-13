import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { ProtocolController, Math as SolMath, FixedPriceOracle, Errors, DebtToken, MintableToken } from "../typechain";

describe("Two markets", function () {
  let debtTokenOne: DebtToken
  let debtTokenTwo: DebtToken
  let underTokenOne: MintableToken
  let underTokenTwo: MintableToken
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
    const DebtToken = await ethers.getContractFactory("DebtToken",
      {
        libraries: {
          Math: mathContract.address,
        },
      })
    const MintableToken = await ethers.getContractFactory("MintableToken")
    const ConstantRateModel = await ethers.getContractFactory("ConstantRateModel")
    const interestModel = await ConstantRateModel.deploy(0, 1)
    underTokenOne = await MintableToken.deploy("TEST 1", "TST1")
    underTokenTwo = await MintableToken.deploy("TEST 2", "TST2")
    debtTokenOne = await DebtToken.deploy("Debt TEST Token 1", "dTST1", underTokenOne.address, protocolContract.address, interestModel.address)
    debtTokenTwo = await DebtToken.deploy("Debt TEST Token 2", "dTST2", underTokenTwo.address, protocolContract.address, interestModel.address)
    await protocolContract.addMarket(debtTokenOne.address, 95, 100, underTokenOne.address)
    await protocolContract.addMarket(debtTokenTwo.address, 95, 100, underTokenTwo.address)
  })
  it("User deposit TST1 and TST2, check account liquidity", async function () {
    const [signer, liquidator] = await ethers.getSigners()
    await underTokenOne.mint(signer.address, BigNumber.from(10).pow(6))
    await underTokenTwo.mint(signer.address, BigNumber.from(10).pow(6))
    await priceOracle.setPrice(debtTokenOne.address, 3, 1)
    await priceOracle.setPrice(debtTokenTwo.address, 4, 1)
    await underTokenOne.approve(debtTokenOne.address, BigNumber.from(10).pow(6))
    await underTokenTwo.approve(debtTokenTwo.address, BigNumber.from(10).pow(6))
    await debtTokenOne.mint(BigNumber.from(10).pow(6))
    await debtTokenTwo.mint(BigNumber.from(10).pow(6))
    const [solvent, balance] = await protocolContract.getExpectedLiquidity(signer.address, ethers.constants.AddressZero, 0, 0)
    expect(solvent).to.be.true
    expect(balance).to.be.equals(BigNumber.from(1000000).mul(7).mul(95).div(100))
  })
  it.only("User deposit TST1 and borrows TST2, then TST1 value falls drastically, TST1 can be liquidate?", async function () {
    const [signer, liquidator] = await ethers.getSigners()
    await underTokenOne.mint(signer.address, BigNumber.from(10).pow(6))
    await priceOracle.setPrice(debtTokenOne.address, 4



      , 1)
    await priceOracle.setPrice(debtTokenTwo.address, 3, 1)
    const liquidatorUnderTokenTwo = underTokenTwo.connect(liquidator)
    const liquidatorDebtTokenTwo = debtTokenTwo.connect(liquidator)
    const liquidatorUnderTokenOne = underTokenOne.connect(liquidator)
    const liquidatorDebtTokenOne = debtTokenOne.connect(liquidator)
    await liquidatorUnderTokenTwo.mint(liquidator.address, BigNumber.from(10).pow(6))
    await liquidatorUnderTokenTwo.approve(debtTokenTwo.address, BigNumber.from(10).pow(6))
    await liquidatorDebtTokenTwo.mint(BigNumber.from(10).pow(5).mul(5))
    await underTokenOne.approve(debtTokenOne.address, BigNumber.from(10).pow(6))
    await underTokenTwo.approve(debtTokenTwo.address, BigNumber.from(10).pow(6))
    await debtTokenOne.mint(BigNumber.from(10).pow(5).mul(5))
    await debtTokenTwo.borrow(BigNumber.from(10).pow(5).mul(5))
    await priceOracle.setPrice(debtTokenOne.address, 3, 1)
    let [solvent, balance] = await protocolContract.getExpectedLiquidity(signer.address, ethers.constants.AddressZero, 0, 0)
    expect(solvent).to.be.false
    expect(balance).to.be.equals(75000)
    const price = await priceOracle.getPrice(debtTokenOne.address);
    await debtTokenOne.mint(BigNumber.from(75000).mul(price.denominator).div(price.numerator).mul(10).div(8));
    [solvent, balance] = await protocolContract.getExpectedLiquidity(signer.address, ethers.constants.AddressZero, 0, 0)
    expect(solvent).to.be.true
    // expect(await protocolContract.allowLiquidate(debtTokenTwo.address, debtTokenOne.address, signer.address, liquidator.address, 10, { numerator: 1, denominator: 1, })).to.be.equals(0)
    // const [success, repayAmount] = await protocolContract.calculateRepayAmount(signer.address, debtTokenTwo.address, debtTokenOne.address, { numerator: 10, denominator: 9 })
    // expect(success).to.be.true;
    // 
    // await debtTokenOne.mint(repayAmount.mul(price.denominator).div(price.numerator).mul(10).div(8));
    // [solvent, balance] = await protocolContract.getExpectedLiquidity(signer.address, ethers.constants.AddressZero, 0, 0)
    // await liquidatorUnderTokenOne.mint(liquidator.address, BigNumber.from(10).pow(6))
    // await liquidatorUnderTokenOne.approve(debtTokenOne.address, BigNumber.from(10).pow(6))
    // await protocolContract.calculateAmountOfCollateral(debtTokenOne.address, )
  })
});
