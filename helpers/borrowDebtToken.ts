import { ethers } from "hardhat";
import { exit } from "process";
import { readFileSync } from "fs";
import { join } from "path";
import { Tokens } from "./helpers/types";

async function main() {
  const pathfile = join(__dirname, "./output/contracts.json");
  const object: Tokens = JSON.parse(readFileSync(pathfile).toString());

  const DebtToken = await ethers.getContractFactory("DebtToken", {
    libraries: { Math: object.Math },
  });
  const MintableToken = await ethers.getContractFactory("MintableToken");

  const tokenOne = MintableToken.attach(object.TokenTest1);
  const debtTokenOne = DebtToken.attach(object.DebtTokenTest1);

  await tokenOne.approve(object.DebtTokenTest1, 100);
  await debtTokenOne.mint(100);
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
