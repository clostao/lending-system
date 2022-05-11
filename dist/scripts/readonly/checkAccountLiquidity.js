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
    const ProtocolController = await hardhat_1.ethers.getContractFactory("ProtocolController", {
        libraries: { Math: object.Math },
    });
    const controller = ProtocolController.attach(object.ProtocolController);
    const [solvent, balance] = await controller.getExpectedLiquidity(signer.address, object.DebtTokenTest1, 0, 0);
    console.log(solvent ? balance.toString() : balance.mul(-1).toString());
    console.log("Markets have been added to controller.");
}
main().catch((err) => {
    console.error(err);
    (0, process_1.exit)(err);
});
