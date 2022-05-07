import { ethers } from "hardhat";
import { exit } from "process";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";

async function main() {
  const FixedPriceOracle = await ethers.getContractFactory("ConstantRateModel");

  const InterestRateModel = await FixedPriceOracle.deploy(1);

  const pathfile = join(__dirname, "./output/contracts.json");
  const object = JSON.parse(readFileSync(pathfile).toString());
  object.InterestRateModel = InterestRateModel.address;
  writeFileSync(pathfile, JSON.stringify(object));
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
