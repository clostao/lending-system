"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const process_1 = require("process");
const path_1 = require("path");
const fs_1 = require("fs");
async function main() {
    const pathfile = (0, path_1.join)(__dirname, "./output/contracts.json");
    const data = JSON.parse((0, fs_1.readFileSync)(pathfile).toString());
    const ProtocolController = await hardhat_1.ethers.getContractFactory("ProtocolController", {
        libraries: {
            Math: data.Math,
        },
    });
    const protocolController = await ProtocolController.deploy();
    data.ProtocolController = protocolController.address;
    (0, fs_1.writeFileSync)(pathfile, JSON.stringify(data));
}
main().catch((err) => {
    console.error(err);
    (0, process_1.exit)(err);
});
