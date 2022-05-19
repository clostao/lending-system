import { Button, Checkbox, Input } from "@mui/material"
import { utils } from "ethers"
import { BigNumber } from "ethers"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { isBigNumberish } from "@ethersproject/bignumber/lib/bignumber"
import { useLend } from "../../hooks/useLend"
import { dTokenInfo } from "../../types"

const RedeemTransactionComponentWrapper = styled.div`
    width: 30vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    > * {
        margin-bottom: 1rem;
    }
`

const TransactionTitle = styled.h1`
    font-weight: 600;
`

const TransactionDescription = styled.p`
    font-weight: 400;
    font-size: medium;
`

const ExecutionButtonsWrapper = styled.div`
    display: flex;
    justify-content: space-around;
`

const PaddedButton = styled(Button)`
    padding: 0.2rem;
    background: black;
    color: white;
    border-radius: 1rem;
`

const InputWithPlaceholder = styled.span`
    display: flex;
    justify-content:center;
    align-items: center;
`

export const RedeemTransactionComponent = ({ dToken }: { dToken: string }) => {
    const [amount, setAmount] = useState('0');
    const { redeem, getDebtTokensInfo, getUserDebtSnapshot } = useLend()
    const [payFull, setPayFull] = useState(false);
    const [accountSnapshot, setAccountSnapshot] = useState<{
        borrowedTokens: BigNumber;
        collateralizedTokens: BigNumber;
    }>()
    const [debtTokenInfo, setDebtTokenInfo] = useState<dTokenInfo>()

    useEffect(() => {
        getDebtTokensInfo().then(balances => setDebtTokenInfo(balances[dToken]))
    }, [getDebtTokensInfo, setDebtTokenInfo, dToken])

    useEffect(() => {
        getUserDebtSnapshot(dToken).then(setAccountSnapshot)
    }, [getUserDebtSnapshot, setAccountSnapshot, dToken])

    return <RedeemTransactionComponentWrapper>
        <TransactionTitle>Redeem {debtTokenInfo?.symbol ?? "XXX"}</TransactionTitle>
        <TransactionDescription>In this transaction you will burn your dTokens in exchange for Tokens at the current exchange rate.</TransactionDescription>
        <>Your balance is ~{accountSnapshot ? utils.formatEther(accountSnapshot.collateralizedTokens) : "XXX"} Tokens</>
        <InputWithPlaceholder>Pay full debt: <Checkbox checked={payFull} onChange={() => setPayFull(!payFull)} /></InputWithPlaceholder>
        <Input disabled={payFull} type='string' value={amount} onChange={(ev) => setAmount(ev.target.value)} placeholder="Amount to be deposited" />
        <ExecutionButtonsWrapper>
            <PaddedButton disabled={(!isBigNumberish(amount) && !Number(amount))} onClick={() => redeem(dToken, payFull ? null : utils.parseEther(amount))}>Execute</PaddedButton>
        </ExecutionButtonsWrapper>
    </RedeemTransactionComponentWrapper>
}