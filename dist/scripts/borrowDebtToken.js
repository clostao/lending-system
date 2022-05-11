"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const process_1 = require("process");
const fs_1 = require("fs");
const path_1 = require("path");
async function main() {
    const pathfile = (0, path_1.join)(__dirname, "./output/contracts.json");
    const object = JSON.parse((0, fs_1.readFileSync)(pathfile).toString());
    const DebtToken = await hardhat_1.ethers.getContractFactory("DebtToken", {
        libraries: { Math: object.Math },
    });
    const MintableToken = await hardhat_1.ethers.getContractFactory("MintableToken");
    const tokenOne = MintableToken.attach(object.TokenTest1);
    const debtTokenOne = DebtToken.attach(object.DebtTokenTest1);
    await tokenOne.approve(object.DebtTokenTest1, 100);
    await debtTokenOne.mint(100);
}
main().catch((err) => {
    console.error(err);
    (0, process_1.exit)(err);
});
