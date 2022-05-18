import { ethers } from "hardhat";
import { exit } from "process";
import { readFileSync } from "fs";
import { join } from "path";
import { Tokens } from "../helpers/types";

async function main() {
  const [signer] = await ethers.getSigners();
  const pathfile = join(__dirname, "../output/contracts.json");
  const object: Tokens = JSON.parse(readFileSync(pathfile).toString());

  const ERC20 = await ethers.getContractFactory("ERC20");

  const debtToken = ERC20.attach(object.DebtTokenTest1);
  const underToken = ERC20.attach(object.TokenTest1);

  const debtBalance = await debtToken.balanceOf(signer.address)
  const underBalance = await underToken.balanceOf(signer.address)

  console.log(`Balances are:`);
  console.log(`dTST1: ${debtBalance}`);
  console.log(`TST1: ${underBalance}`);
}

main().catch((err) => {
  console.error(err);
  exit(err);
});