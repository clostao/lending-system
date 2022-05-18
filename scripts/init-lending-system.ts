import { CONNREFUSED } from 'dns';
import { Contract } from 'ethers/lib/ethers';
import { ethers } from 'hardhat'

async function main() {

    const contracts: { [k: string]: Contract } = {}

    const Math = await ethers.getContractFactory("Math");

    contracts.Math = await Math.deploy()

    const LinealRateModel = await ethers.getContractFactory("LinealRateModel");
    const MintableToken = await ethers.getContractFactory("MintableToken")
    const DebtToken = await ethers.getContractFactory("DebtToken", { libraries: { Math: contracts.Math.address } })
    const ProtocolController = await ethers.getContractFactory("ProtocolController", { libraries: { Math: contracts.Math.address } })
    const FixedPriceOracle = await ethers.getContractFactory("FixedPriceOracle");

    contracts.PriceOracle = await FixedPriceOracle.deploy()

    contracts.LinealRateModel = await LinealRateModel.deploy(1, 1)

    contracts.Token1 = await MintableToken.deploy("TST1", "TST1")
    contracts.Token2 = await MintableToken.deploy("TST2", "TST2")

    contracts.ProtocolController = await ProtocolController.deploy(contracts.PriceOracle.address)

    contracts.dToken1 = await DebtToken.deploy("debt TST1", "dTST1", contracts.Token1.address, contracts.ProtocolController.address, contracts.LinealRateModel.address)
    contracts.dToken2 = await DebtToken.deploy("debt dTST2", "dTST2", contracts.Token2.address, contracts.ProtocolController.address, contracts.LinealRateModel.address)

    await contracts.PriceOracle.setPrice(contracts.dToken1.address, 1, 1)
    await contracts.PriceOracle.setPrice(contracts.dToken2.address, 1, 1)



    contracts.ProtocolController.addMarket(contracts.dToken1.address, 80, 100, contracts.Token1.address)
    contracts.ProtocolController.addMarket(contracts.dToken2.address, 80, 100, contracts.Token2.address)

}

main().then(() => console.log("Todo OK")).catch((err) => {
    console.error(err);
})