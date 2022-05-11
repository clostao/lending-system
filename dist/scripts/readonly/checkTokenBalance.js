"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const process_1 = require("process");
const fs_1 = require("fs");
const path_1 = require("path");
async function main() {
    const [signer] = await hardhat_1.ethers.getSigners();
    const pathfile = (0, path_1.join)(__dirname, "../output/contracts.json");
    const object = JSON.parse((0, fs_1.readFileSync)(pathfile).toString());
    const ERC20 = await hardhat_1.ethers.getContractFactory("ERC20");
    const debtToken = ERC20.attach(object.DebtTokenTest1);
    const underToken = ERC20.attach(object.TokenTest1);
    const debtBalance = await debtToken.balanceOf(signer.address);
    const underBalance = await underToken.balanceOf(signer.address);
    console.log(`Balances are:`);
    console.log(`dTST1: ${debtBalance}`);
    console.log(`TST1: ${underBalance}`);
}
main().catch((err) => {
    console.error(err);
    (0, process_1.exit)(err);
});
