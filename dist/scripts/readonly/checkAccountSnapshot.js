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
    const DebtToken = await hardhat_1.ethers.getContractFactory("DebtToken", {
        libraries: { Math: object.Math },
    });
    const debtToken = DebtToken.attach(object.DebtTokenTest1);
    const [borrowed, collateral] = await debtToken.getAccountSnapshot(signer.address);
    console.log(`Signer has borrowed ${borrowed.toString()}`);
    console.log(`Signer has supplied ${collateral.toString()}`);
}
main().catch((err) => {
    console.error(err);
    (0, process_1.exit)(err);
});
