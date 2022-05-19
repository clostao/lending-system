import { Button, Input } from "@mui/material"
import { BigNumber } from "ethers"
import { useState } from "react"
import styled from "styled-components"
import { useLend } from "../../hooks/useLend"

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

export const RedeemTransactionComponent = ({ dToken }: { dToken: string }) => {
    const [amount, setAmount] = useState('0');
    const { redeemDebtToken } = useLend()
    return <RedeemTransactionComponentWrapper>
        <TransactionTitle>Redeem dT1oken</TransactionTitle>
        <TransactionDescription>In this transaction you will burn your dTokens in exchange for Tokens at the current exchange rate.</TransactionDescription>
        Your balance is 1000 Tokens
        <Input type='string' value={amount} onChange={(ev) => setAmount(ev.target.value)} placeholder="Amount to be deposited" />
        <ExecutionButtonsWrapper>
            <PaddedButton onClick={() => redeemDebtToken(dToken, BigNumber.from(0))}>Execute</PaddedButton>
        </ExecutionButtonsWrapper>
    </RedeemTransactionComponentWrapper>
}