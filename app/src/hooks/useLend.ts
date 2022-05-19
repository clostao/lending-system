import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { useCallback, useMemo } from "react"
import { DebtTokenABI, MintableTokenABI, ProtocolControllerABI } from "../abi";
import { Contracts } from "../Config";
import { DebtToken, MintableToken, ProtocolController } from "../typechain";
import { dTokenInfo } from "../types";
import { useWallet } from "./useWallet"

export const useLend = () => {

    const { signer, provider } = useWallet()

    const contracts = useMemo(() => {
        console.log(signer);

        const _provider = signer ?? provider;
        const tokens = Contracts.tokens.map(({ underlying, debt }) => {
            const underlyingToken = new Contract(underlying, MintableTokenABI, _provider) as MintableToken;
            const debtToken = new Contract(debt, DebtTokenABI, _provider) as DebtToken;
            return { underlying: underlyingToken, debt: debtToken }
        })
        const controller = new Contract(Contracts.controller, ProtocolControllerABI, _provider) as ProtocolController
        return {
            controller,
            tokens
        }
    }, [signer, provider])

    const tokensByAddress = useMemo(() => Object.fromEntries(contracts.tokens.map(({ debt }) => [debt.address, debt])), [contracts])

    const getDebtTokensInfo: () => Promise<Record<string, dTokenInfo>> = useCallback(async () => {
        return Object.fromEntries(await Promise.all(contracts.tokens.map(async ({ debt, underlying }) => {
            const currentExchangeRate = await debt.exchangeRate()
            const dTokenTotalSupply = await debt.totalSupply()
            const supplied = dTokenTotalSupply.mul(currentExchangeRate.denominator).div(currentExchangeRate.numerator)
            const borrowed = supplied.sub(await underlying.balanceOf(debt.address))
            const name = await underlying.name()
            const symbol = await underlying.symbol()
            return [debt.address, { borrowed, supplied, name, symbol }]
        })))

    }, [contracts])

    const dTokens = useMemo(() => contracts.tokens.map(({ debt }) => debt.address), [contracts])

    const mintDebtToken = useCallback(async (debtToken: string, amount: BigNumber) => {
        tokensByAddress[debtToken].mint(BigNumber.from("693999970000000000")).then(e => alert('Minting transaction was sent successfully')).catch((err) => {
            console.log(err)
            alert('Minting transaction failed.')
        })
    }, [tokensByAddress])

    const redeemDebtToken = useCallback(async (debtToken: string, amount: BigNumber) => {
        tokensByAddress[debtToken].redeem(BigNumber.from("693999970000000000")).then(e => alert('Redeem transaction was sent successfully')).catch((err) => {
            console.log(err)
            alert('Redeem transaction failed.')
        })
    }, [tokensByAddress])

    return {
        contracts,
        dTokens,
        getDebtTokensInfo,
        mintDebtToken,
        redeemDebtToken
    }
}