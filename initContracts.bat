yarn hardhat run scripts/deployTestTokens.ts --network localGanache
yarn hardhat run scripts/deployLibs.ts --network localGanache
yarn hardhat run scripts/deployPriceOracle.ts --network localGanache
yarn hardhat run scripts/deployInterestModel.ts --network localGanache
yarn hardhat run scripts/deployProtocolController.ts --network localGanache
yarn hardhat run scripts/deployDebtTokens.ts --network localGanache
yarn hardhat run scripts/setupDebtTokensIntoController.ts --network localGanache
