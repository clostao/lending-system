import { BigNumber, constants } from "ethers";
import { Contract } from "ethers";
import { useCallback, useMemo } from "react"
import { DebtTokenABI, MintableTokenABI, ProtocolControllerABI } from "../abi";
import { Contracts } from "../Config";
import { DebtToken, MintableToken, ProtocolController } from "../typechain";
import { dTokenInfo } from "../types";
import { useWallet } from "./useWallet"

export const useLend = () => {

    const { signer, provider, address } = useWallet()

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

    const getBorrowAmount = useCallback(({ dToken, targetAddress = address, factor = [75, 100] }: { dToken: string, targetAddress?: string | undefined, factor?: [number, number] }) => {
        if (!targetAddress) throw new Error("Invalid address");
        const [numerator, denominator] = factor
        return contracts.controller.calculateAmountOfBorrow(targetAddress, dToken, { numerator, denominator })
    }, [address])


    const getUserUnderlyingBalance = useCallback(async (dToken: string, targetAddress = address) => {
        if (!targetAddress) throw new Error('Invalid address.');
        const underlyingAddress = await tokensByAddress[dToken].underlyingAsset()
        const underlyingContract: MintableToken = new Contract(underlyingAddress, MintableTokenABI, signer) as MintableToken;
        const underlyingBalance = await underlyingContract.balanceOf(targetAddress)
        return underlyingBalance
    }, [signer, address, tokensByAddress])

    const dTokens = useMemo(() => contracts.tokens.map(({ debt }) => debt.address), [contracts])

    const getUserDebtSnapshot = useCallback(async (dToken: string, targetAddress = address) => {
        if (!targetAddress) throw new Error("Invalid address.")
        return await tokensByAddress[dToken].getAccountSnapshot(targetAddress)
    }, [address, tokensByAddress])

    const mint = useCallback(async (debtToken: string, amount: BigNumber) => {
        tokensByAddress[debtToken].mint(amount).then(e => alert('Minting transaction was sent successfully')).catch((err) => {
            console.log(err)
            alert('Minting transaction failed.')
        })
    }, [tokensByAddress])

    const redeem = useCallback(async (debtToken: string, amount: BigNumber | null) => {
        const currentExchangeRate = await tokensByAddress[debtToken].exchangeRate()
        const normalizedAmount = amount === null ? constants.MaxUint256 : amount.mul(currentExchangeRate.numerator).div(currentExchangeRate.denominator)
        tokensByAddress[debtToken].redeem(normalizedAmount).then(e => alert('Redeem transaction was sent successfully')).catch((err) => {
            console.log(err)
            alert('Redeem transaction failed.')
        })
    }, [tokensByAddress])

    const borrow = useCallback(async (debtToken: string, amount: BigNumber) => {
        tokensByAddress[debtToken].borrow(amount).then(e => alert('Minting transaction was sent successfully')).catch((err) => {
            console.log(err)
            alert('Minting transaction failed.')
        })
    }, [tokensByAddress])

    const repay = useCallback(async (debtToken: string, amount: BigNumber) => {
        tokensByAddress[debtToken].repay(amount).then(e => alert('Minting transaction was sent successfully')).catch((err) => {
            console.log(err)
            alert('Minting transaction failed.')
        })
    }, [tokensByAddress])

    const checkAllowance = useCallback(async (dToken: string, targetAddress = address) => {
        if (!targetAddress) throw new Error("Invalid address.")
        const underlyingAddress = await tokensByAddress[dToken].underlyingAsset()
        const underlyingToken = new Contract(underlyingAddress, MintableTokenABI, signer) as MintableToken
        return await underlyingToken.allowance(targetAddress, dToken)
    }, [signer, address, tokensByAddress])

    const approve = useCallback(async (dToken: string) => {
        const underlyingAddress = await tokensByAddress[dToken].underlyingAsset()
        const underlyingToken = new Contract(underlyingAddress, MintableTokenABI, signer) as MintableToken
        return await underlyingToken.approve(dToken, constants.MaxUint256).then(() => alert('Approve transaction was sent successfully')).catch(() => alert('Error approving allowance.'))
    }, [signer, tokensByAddress])

    return {
        contracts,
        dTokens,
        getDebtTokensInfo,
        getUserDebtSnapshot,
        getUserUnderlyingBalance,
        // Protocol controller helpers
        getBorrowAmount,
        // Underlying asset methods
        checkAllowance,
        approve,
        // dToken methods
        mint,
        redeem,
        borrow,
        repay
    }
}