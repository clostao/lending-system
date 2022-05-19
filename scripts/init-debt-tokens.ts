import { BigNumber, Contract } from 'ethers/lib/ethers';
import { readFileSync } from 'fs';
import { ethers } from 'hardhat'
import { join } from 'path';
import { DebtToken, MintableToken } from '../typechain'

async function main() {
    const [signer] = await ethers.getSigners();
    const contracts: { [k: string]: string } = {
        "Math": "0xB1b54f074FB6511019515E2ef16a3872F5eb0aB5",
        "PriceOracle": "0x8c2e4C6fc7D802d4e2C3E3325c5a838A4c263C9e",
        "ContantRateModel": "0x2B1b38973Ca74839ea6b93d9fe565C4dC97Ce7da",
        "Token1": "0x20C03C0568078c4fa8217691fBc0a08DB7f2c486",
        "Token2": "0x81c8D46f189CbbE066bAA3364310Cbb707a9c427",
        "ProtocolController": "0x20cAFbeDb2B54072E8D8501dbEB3Ef7E0cA5595C",
        "dToken1": "0xb157720344196869ace19830346AE11e57a6b013",
        "dToken2": "0xA70f02F55BC34e89eAeDdBc581a525b63dCD67d3"
    }
    const Config: {
        tokens: { underlying: string, debt: string }[],
        controller: string
    } = {
        "controller": "0x20cAFbeDb2B54072E8D8501dbEB3Ef7E0cA5595C",
        "tokens": [
            {
                "underlying": "0x20C03C0568078c4fa8217691fBc0a08DB7f2c486",
                "debt": "0xb157720344196869ace19830346AE11e57a6b013"
            },
            {
                "underlying": "0x81c8D46f189CbbE066bAA3364310Cbb707a9c427",
                "debt": "0xA70f02F55BC34e89eAeDdBc581a525b63dCD67d3"
            }
        ]
    }
    const MintableTokenFactory = await ethers.getContractFactory("MintableToken")
    const DebtToken = await ethers.getContractFactory("DebtToken", { libraries: { Math: contracts.Math } })

    const { tokens } = Config

    for (const { underlying, debt } of tokens) {
        console.log("Minting underlying tokens for:", signer.address)
        const mintableToken: MintableToken = MintableTokenFactory.attach(underlying)
        const dToken: DebtToken = DebtToken.attach(underlying)
        await mintableToken.mint(signer.address, BigNumber.from(10).pow(21)).catch(() => {
            console.error("Mint failed!")
        })
        await mintableToken.approve(debt, BigNumber.from(10).pow(21))
    }

}

main().then(() => console.log("Todo OK")).catch((err) => {
    console.error(err);
})