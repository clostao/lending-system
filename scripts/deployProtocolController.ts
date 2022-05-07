import { ethers } from "hardhat";
import { exit } from "process";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import { Tokens } from "./helpers/types";

async function main() {
  const pathfile = join(__dirname, "./output/contracts.json");
  const data: Tokens = JSON.parse(readFileSync(pathfile).toString());
  const ProtocolController = await ethers.getContractFactory(
    "ProtocolController",
    {
      libraries: {
        Math: data.Math,
      },
    }
  );

  const protocolController = await ProtocolController.deploy();

  data.ProtocolController = protocolController.address;
  writeFileSync(pathfile, JSON.stringify(data));
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
