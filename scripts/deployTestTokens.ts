import { ethers } from "hardhat";
import { exit } from "process";

async function main() {
  const MintableToken = ethers.getContractFactory("M");
}

main().catch((err) => exit(err));
