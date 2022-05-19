import { BigNumber, Contract } from 'ethers/lib/ethers';
import { readFileSync } from 'fs';
import { ethers } from 'hardhat'
import { join } from 'path';
import { DebtToken, MintableToken } from '../typechain'

async function main() {
    const [signer] = await ethers.getSigners();
    const contracts: { [k: string]: string } = {
        "Math": "0x91dE48C6F7A803b875521Ee0eD0dF7CC1351Dc73",
        "PriceOracle": "0xF0FFf232bc6a3AcB218982dF0B0A5F24aAD2F707",
        "ContantRateModel": "0x5C10F160014F5321b99A48c36042Dd0dbE0AA818",
        "Token1": "0x22809A0a7cbE1bA81B629437c41f6E1B508a65B6",
        "Token2": "0x25879e82fF60eDCe60EF970e8f964E322222d86c",
        "ProtocolController": "0x42E3A9B9511287F5D2c2dd09cB4Ed29e435A284B",
        "dToken1": "0xA70485BEc4927FAe3B5af75f84B94C150F0f4136",
        "dToken2": "0x33A9D08652B99cFC4e43fa844017b62c7eb5b3c7"
    }
    const Config: {
        tokens: { underlying: string, debt: string }[],
        controller: string
    } = {
        "controller": "0x42E3A9B9511287F5D2c2dd09cB4Ed29e435A284B",
        "tokens": [
            {
                "underlying": "0x22809A0a7cbE1bA81B629437c41f6E1B508a65B6",
                "debt": "0xA70485BEc4927FAe3B5af75f84B94C150F0f4136"
            },
            {
                "underlying": "0x25879e82fF60eDCe60EF970e8f964E322222d86c",
                "debt": "0x33A9D08652B99cFC4e43fa844017b62c7eb5b3c7"
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