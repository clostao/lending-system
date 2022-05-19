import { BigNumber, Contract } from 'ethers/lib/ethers';
import { readFileSync } from 'fs';
import { ethers } from 'hardhat'
import { join } from 'path';
import { DebtToken, MintableToken } from '../typechain'

async function main() {
    const [signer] = await ethers.getSigners();
    const contracts: { [k: string]: string } = {
        "Math": "0x47E92170b4737B663DfC7D80cC5C6B7Bd8f3bB0a",
        "PriceOracle": "0xf1b6f83Efee829A037Cd18b97948562bEA1d11f7",
        "LinealRateModel": "0xF1551a1fe1c680b08D1E23aD26C88C23DfA76706",
        "Token1": "0x1383578771dc9fA53931cBb299AD99Fefc4c3299",
        "Token2": "0xC55a9ac4aC2D58d65fA80aD15f1ea42443422B08",
        "ProtocolController": "0xd1666B19C4eb72377c80325ae168E94B69A98b13",
        "dToken1": "0xf361E2de45d5Dc701Bf97be070C5Abd198235d13",
        "dToken2": "0xd86e804732d99C0639Fe14229227F82B12ee04Ec"
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
    console.log("Minting underlying tokens for:", signer.address)
    for (const { underlying, debt } of tokens) {
        const dToken: DebtToken = DebtToken.attach(underlying)
        await dToken.mint(BigNumber.from(10).pow(18), {
            gasLimit: 5000000,
        })
    }

}

main().then(() => console.log("Todo OK")).catch((err) => {
    console.error(err);
})