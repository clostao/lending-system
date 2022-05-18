import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { exit } from "process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

async function main() {
  const [signer] = await ethers.getSigners();
  const MintableToken = await ethers.getContractFactory("MintableToken");

  const tokenOne = await MintableToken.deploy("Test 1", "TS1");
  const tokenTwo = await MintableToken.deploy("Test 2", "TS2");

  const mintedAmount = BigNumber.from(10).pow(18);

  await tokenOne.mint(signer.address, mintedAmount);
  await tokenTwo.mint(signer.address, mintedAmount);

  console.log(`Tokens deployed: `);
  console.log(
    `Tokens one: ${
      tokenOne.address
    } and minted tokens ${mintedAmount.toString()} to ${signer.address}`
  );
  console.log(
    `Tokens deployed: ${
      tokenTwo.address
    } and minted tokens ${mintedAmount.toString()} to ${signer.address}`
  );

  const pathfile = join(__dirname, "./output/contracts.json");

  const object = JSON.parse(readFileSync(pathfile).toString());

  object.TokenTest1 = tokenOne.address;
  object.TokenTest2 = tokenTwo.address;

  writeFileSync(pathfile, JSON.stringify(object));
}

main().catch((err) => {
  console.error(err);
  exit(err);
});
