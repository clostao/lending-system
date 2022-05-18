import { ethers } from "hardhat";
import { exit } from "process";
import { readFileSync } from "fs";
import { join } from "path";
import { Tokens } from "../helpers/types";

async function main() {
  const pathfile = join(__dirname, "../output/contracts.json");
  const object: Tokens = JSON.parse(readFileSync(pathfile).toString());

  const DebtToken = await ethers.getContractFactory("DebtToken", {
    libraries: { Math: object.Math },
  });

  const dToken = DebtToken.attach(object.DebtTokenTest1);

  console.log(await dToken.controller());

  console.log("Markets have been added to controller.");
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
