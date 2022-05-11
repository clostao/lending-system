"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const process_1 = require("process");
async function main() {
    const MintableToken = await hardhat_1.ethers.getContractFactory("MintableToken");
    const tokenOne = await MintableToken.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
    console.log((await tokenOne.balanceOf("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")).toString());
    await tokenOne.transfer("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", 10);
    console.log((await tokenOne.balanceOf("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")).toString());
}
main().catch((err) => {
    console.error(err);
    (0, process_1.exit)(err);
});
