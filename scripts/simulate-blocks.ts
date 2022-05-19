import { ethers } from "hardhat"

async function main() {
    const [signer] = await ethers.getSigners();
    const blockToSimulate = 100;
    for (const _ of Array(blockToSimulate).fill(1)) {
        await signer.sendTransaction({
            to: signer.address,
            value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
        });
    }

}

main().then(() => console.log("Todo OK")).catch((err) => {
    console.error(err);
})