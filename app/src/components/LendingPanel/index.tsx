import { Button } from "@mui/material"
import { utils } from "ethers"
import { useCallback, useEffect, useState } from "react"
import { useLend } from "../../hooks/useLend"
import { useWallet } from "../../hooks/useWallet"
import { Action, dTokenInfo } from "../../types"
import { ActionModalController } from "../ActionModalController"
import { LendingPanelColumn, LendingPanelColumnHeader, LendingPanelRow, LendingPanelWrapper } from "./Styles"

export const LendingPanel = () => {
    const { signer } = useWallet()
    const [action, setAction] = useState<Action>()
    const [selectedDebtToken, setDebtToken] = useState<string>("")
    const { getDebtTokensInfo, dTokens } = useLend();
    const [balances, setBalances] = useState<Record<string, dTokenInfo>>()

    const updateModalAction = useCallback((action: Action, dToken: string) => {
        setAction(action)
        setDebtToken(dToken)
    }, [setAction, setDebtToken])

    useEffect(() => {
        getDebtTokensInfo().then(setBalances)
    }, [getDebtTokensInfo, setBalances])

    return <LendingPanelWrapper>
        <ActionModalController dToken={selectedDebtToken} action={action} onClose={() => setAction(undefined)}></ActionModalController>
        <LendingPanelRow>
            <LendingPanelColumnHeader>Token</LendingPanelColumnHeader>
            <LendingPanelColumnHeader>Supplied</LendingPanelColumnHeader>
            <LendingPanelColumnHeader>Borrowed</LendingPanelColumnHeader>
            <LendingPanelColumnHeader>Your supply</LendingPanelColumnHeader>
            <LendingPanelColumnHeader>Your borrows</LendingPanelColumnHeader>
            <LendingPanelColumnHeader>Supply actions</LendingPanelColumnHeader>
            <LendingPanelColumnHeader>Borrow actions</LendingPanelColumnHeader>
        </LendingPanelRow>
        {
            dTokens.map(address => {
                const balance = (balances ?? {})[address]
                return <LendingPanelRow>
                    <LendingPanelColumn>ETH</LendingPanelColumn>
                    <LendingPanelColumn>{balance ? `${utils.formatEther(balance.supplied)} ${balance.symbol}` : 'Loading...'}</LendingPanelColumn>
                    <LendingPanelColumn>{balance ? `${utils.formatEther(balance.borrowed)} ${balance.symbol}` : 'Loading...'}</LendingPanelColumn>
                    <LendingPanelColumn>20 ETH</LendingPanelColumn>
                    <LendingPanelColumn>0 ETH</LendingPanelColumn>
                    <LendingPanelColumn>
                        <Button disabled={!signer} color="primary" onClick={() => updateModalAction('mint', address)}>Supply</Button>
                        <Button disabled={!signer} color="secondary" onClick={() => updateModalAction('redeem', address)}>Redeem</Button>
                    </LendingPanelColumn>
                    <LendingPanelColumn>
                        <Button disabled={!signer} color="primary" onClick={() => updateModalAction('borrow', address)}>Borrow</Button>
                        <Button disabled={!signer} color="secondary" onClick={() => updateModalAction('repay', address)}>Repay</Button>
                    </LendingPanelColumn>
                </LendingPanelRow>
            }
            )
        }
    </LendingPanelWrapper>
}