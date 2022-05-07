yarn hardhat run scripts/deployTestTokens.ts --network hardhat
yarn hardhat run scripts/deployLibs.ts --network hardhat
yarn hardhat run scripts/deployPriceOracle.ts --network hardhat
yarn hardhat run scripts/deployInterestModel.ts --network hardhat
yarn hardhat run scripts/deployProtocolController.ts --network hardhat
yarn hardhat run scripts/deployDebtTokens.ts --network hardhat
yarn hardhat run scripts/setupDebtTokensIntoController.ts --network hardhat