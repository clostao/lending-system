"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const process_1 = require("process");
const path_1 = require("path");
const fs_1 = require("fs");
const ethers_1 = require("ethers");
async function main() {
    const FixedPriceOracle = await hardhat_1.ethers.getContractFactory("ConstantRateModel");
    const InterestRateModel = await FixedPriceOracle.deploy(ethers_1.BigNumber.from(10).pow(9).mul(900));
    const pathfile = (0, path_1.join)(__dirname, "./output/contracts.json");
    const object = JSON.parse((0, fs_1.readFileSync)(pathfile).toString());
    object.InterestRateModel = InterestRateModel.address;
    (0, fs_1.writeFileSync)(pathfile, JSON.stringify(object));
}
main().catch((err) => {
    console.error(err);
    (0, process_1.exit)(err);
});
