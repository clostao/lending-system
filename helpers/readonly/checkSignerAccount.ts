import { ethers } from "hardhat";
import { exit } from "process";
import { readFileSync } from "fs";
import { join } from "path";
import { Tokens } from "../helpers/types";

async function main() {
  const [signer] = await ethers.getSigners();
  const pathfile = join(__dirname, "../output/contracts.json");

  console.log(signer.address);
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
