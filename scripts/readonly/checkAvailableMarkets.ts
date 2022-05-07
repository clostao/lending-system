import { ethers } from "hardhat";
import { exit } from "process";
import { readFileSync } from "fs";
import { join } from "path";
import { Tokens } from "../helpers/types";

async function main() {
  const pathfile = join(__dirname, "../output/contracts.json");
  const object: Tokens = JSON.parse(readFileSync(pathfile).toString());

  const ProtocolController = await ethers.getContractFactory(
    "ProtocolController",
    {
      libraries: { Math: object.Math },
    }
  );

  const controller = ProtocolController.attach(object.ProtocolController);

  console.log(await controller.availableMarkets(object.DebtTokenTest1));
  console.log(await controller.availableMarkets(object.DebtTokenTest2));

  console.log("Markets have been added to controller.");
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
