import { ethers } from "hardhat";
import { exit } from "process";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import { BigNumber } from "ethers";

async function main() {
  const FixedPriceOracle = await ethers.getContractFactory("ConstantRateModel");

  const InterestRateModel = await FixedPriceOracle.deploy(BigNumber.from(10).pow(9).mul(900));

  const pathfile = join(__dirname, "./output/contracts.json");
  const object = JSON.parse(readFileSync(pathfile).toString());
  object.InterestRateModel = InterestRateModel.address;
  writeFileSync(pathfile, JSON.stringify(object));
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
