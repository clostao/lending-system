import { BigNumber } from "ethers"
import { DebtToken, MintableToken, ProtocolController } from "../typechain"

export interface BalanceOverview {
    tokens: string[]
    balance: BigNumber
}

export type Action = 'mint' | 'redeem' | 'borrow' | 'repay'

export interface LendContracts {
    tokens: { underlying: MintableToken, debt: DebtToken }[],
    controller: ProtocolController
}

export interface dTokenInfo {
    borrowed: BigNumber
    supplied: BigNumber
    name: string
    symbol: string
}