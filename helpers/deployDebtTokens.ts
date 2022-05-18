import { ethers } from "hardhat";
import { exit } from "process";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import { Tokens } from "./helpers/types";

async function main() {
  const pathfile = join(__dirname, "./output/contracts.json");
  const data: Tokens = JSON.parse(readFileSync(pathfile).toString());
  const DebtToken = await ethers.getContractFactory("DebtToken", {
    libraries: {
      Math: data.Math,
    },
  });

  const dTS1 = await DebtToken.deploy(
    "dTS1",
    "dTS1",
    data.TokenTest1,
    data.ProtocolController,
    data.InterestRateModel
  );

  const dTS2 = await DebtToken.deploy(
    "dTS1",
    "dTS1",
    data.TokenTest1,
    data.ProtocolController,
    data.InterestRateModel
  );

  data.DebtTokenTest1 = dTS1.address;
  data.DebtTokenTest2 = dTS2.address;

  writeFileSync(pathfile, JSON.stringify(data));
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
