import { ethers } from "hardhat";
import { exit } from "process";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";

async function main() {
  const Math = await ethers.getContractFactory("Math");
  const Errors = await ethers.getContractFactory("Errors");

  const mathlib = await Math.deploy();
  const errors = await Errors.deploy();

  const pathfile = join(__dirname, "./output/contracts.json");
  const object = JSON.parse(readFileSync(pathfile).toString());
  object.Math = mathlib.address;
  object.Errors = errors.address;
  writeFileSync(pathfile, JSON.stringify(object));
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
