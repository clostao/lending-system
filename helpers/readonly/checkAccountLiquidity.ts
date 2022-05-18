import { ethers } from "hardhat";
import { exit } from "process";
import { readFileSync } from "fs";
import { join } from "path";
import { Tokens } from "../helpers/types";

async function main() {
  const [signer] = await ethers.getSigners();
  const pathfile = join(__dirname, "../output/contracts.json");
  const object: Tokens = JSON.parse(readFileSync(pathfile).toString());

  const ProtocolController = await ethers.getContractFactory(
    "ProtocolController",
    {
      libraries: { Math: object.Math },
    }
  );

  const controller = ProtocolController.attach(object.ProtocolController);

  const [solvent, balance] = await controller.getExpectedLiquidity(
    signer.address,
    object.DebtTokenTest1,
    0,
    0
  );

  console.log(solvent ? balance.toString() : balance.mul(-1).toString());

  console.log("Markets have been added to controller.");
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
