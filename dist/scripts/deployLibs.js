"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const process_1 = require("process");
const path_1 = require("path");
const fs_1 = require("fs");
async function main() {
    const Math = await hardhat_1.ethers.getContractFactory("Math");
    const Errors = await hardhat_1.ethers.getContractFactory("Errors");
    const mathlib = await Math.deploy();
    const errors = await Errors.deploy();
    const pathfile = (0, path_1.join)(__dirname, "./output/contracts.json");
    const object = JSON.parse((0, fs_1.readFileSync)(pathfile).toString());
    object.Math = mathlib.address;
    object.Errors = errors.address;
    (0, fs_1.writeFileSync)(pathfile, JSON.stringify(object));
}
main().catch((err) => {
    console.error(err);
    (0, process_1.exit)(err);
});
