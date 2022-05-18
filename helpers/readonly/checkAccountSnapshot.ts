import { ethers } from "hardhat";
import { exit } from "process";
import { readFileSync } from "fs";
import { join } from "path";
import { Tokens } from "../helpers/types";

async function main() {
  const [signer] = await ethers.getSigners();
  const pathfile = join(__dirname, "../output/contracts.json");
  const object: Tokens = JSON.parse(readFileSync(pathfile).toString());

  const DebtToken = await ethers.getContractFactory("DebtToken",
    {
      libraries: { Math: object.Math },
    });

  const debtToken = DebtToken.attach(object.DebtTokenTest1)

  const [borrowed, collateral] = await debtToken.getAccountSnapshot(signer.address)

  console.log(`Signer has borrowed ${borrowed.toString()}`);
  console.log(`Signer has supplied ${collateral.toString()}`);
  
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
