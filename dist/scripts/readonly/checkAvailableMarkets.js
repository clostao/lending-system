"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const process_1 = require("process");
const fs_1 = require("fs");
const path_1 = require("path");
async function main() {
    const pathfile = (0, path_1.join)(__dirname, "../output/contracts.json");
    const object = JSON.parse((0, fs_1.readFileSync)(pathfile).toString());
    const ProtocolController = await hardhat_1.ethers.getContractFactory("ProtocolController", {
        libraries: { Math: object.Math },
    });
    const controller = ProtocolController.attach(object.ProtocolController);
    console.log(await controller.marketAddresses(0));
    console.log("Markets have been added to controller.");
}
main().catch((err) => {
    console.error(err);
    (0, process_1.exit)(err);
});
