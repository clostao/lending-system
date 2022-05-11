"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const hardhat_1 = require("hardhat");
const process_1 = require("process");
const fs_1 = require("fs");
const path_1 = require("path");
async function main() {
    const [signer] = await hardhat_1.ethers.getSigners();
    const MintableToken = await hardhat_1.ethers.getContractFactory("MintableToken");
    const tokenOne = await MintableToken.deploy("Test 1", "TS1");
    const tokenTwo = await MintableToken.deploy("Test 2", "TS2");
    const mintedAmount = ethers_1.BigNumber.from(10).pow(18);
    await tokenOne.mint(signer.address, mintedAmount);
    await tokenTwo.mint(signer.address, mintedAmount);
    console.log(`Tokens deployed: `);
    console.log(`Tokens one: ${tokenOne.address} and minted tokens ${mintedAmount.toString()} to ${signer.address}`);
    console.log(`Tokens deployed: ${tokenTwo.address} and minted tokens ${mintedAmount.toString()} to ${signer.address}`);
    const pathfile = (0, path_1.join)(__dirname, "./output/contracts.json");
    const object = JSON.parse((0, fs_1.readFileSync)(pathfile).toString());
    object.TokenTest1 = tokenOne.address;
    object.TokenTest2 = tokenTwo.address;
    (0, fs_1.writeFileSync)(pathfile, JSON.stringify(object));
}
main().catch((err) => {
    console.error(err);
    (0, process_1.exit)(err);
});
