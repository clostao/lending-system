import { ethers } from "hardhat";
import { exit } from "process";
import { readFileSync } from "fs";
import { join } from "path";
import { Tokens } from "../helpers/types";
import { sign } from "crypto";

async function main() {
  const [signer] = await ethers.getSigners();
  const pathfile = join(__dirname, "../output/contracts.json");
  const object: Tokens = JSON.parse(readFileSync(pathfile).toString());

  const ERC20 = await ethers.getContractFactory("ERC20");

  const code = await signer.provider?.getCode(object.TokenTest1);
  if (code == undefined) throw new Error("Contract is not actually deployed.");
  const debtToken = ERC20.attach(object.TokenTest1);

  console.log(await debtToken.balanceOf(signer.address));
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
