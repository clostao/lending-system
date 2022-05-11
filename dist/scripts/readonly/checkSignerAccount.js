"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const process_1 = require("process");
const path_1 = require("path");
async function main() {
    const [signer] = await hardhat_1.ethers.getSigners();
    const pathfile = (0, path_1.join)(__dirname, "../output/contracts.json");
    console.log(signer.address);
}
main().catch((err) => {
    console.error(err);
    (0, process_1.exit)(err);
});
