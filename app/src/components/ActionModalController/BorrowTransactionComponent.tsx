import { Button, Input } from "@mui/material"
import { useState } from "react"
import styled from "styled-components"
import { useLend } from "../../hooks/useLend"

const BorrowTransactionComponentWrapper = styled.div`
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
    text-align: center;
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

const Balance = styled.span`
    text-align: center;
`

const Bold = styled.b`
    font-weight: bolder;
`

export const BorrowTransactionComponent = ({ dToken }: { dToken: string }) => {
    const [amount, setAmount] = useState('0');
    const { borrow } = useLend()

    return <BorrowTransactionComponentWrapper>
        <TransactionTitle>Repay Token</TransactionTitle>
        <TransactionDescription>In this transaction you will repay your Tokens debt stop accumulating interest for the canceled debt.</TransactionDescription>
        <Balance>Your borrow is <Bold>0</Bold> Tokens</Balance>
        <Balance>Your maximum recommended borrow balance is <Bold>10.23</Bold> Tokens</Balance>
        <Input type='string' value={amount} onChange={(ev) => setAmount(ev.target.value)} placeholder="Amount to be deposited" />
        <ExecutionButtonsWrapper>
            <PaddedButton>Execute</PaddedButton>
        </ExecutionButtonsWrapper>
    </BorrowTransactionComponentWrapper>
}