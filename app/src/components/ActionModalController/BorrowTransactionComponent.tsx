import { isBigNumberish } from "@ethersproject/bignumber/lib/bignumber"
import { Button, Input } from "@mui/material"
import { utils } from "ethers"
import { BigNumber } from "ethers"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { useLend } from "../../hooks/useLend"
import { dTokenInfo } from "../../types"

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
    const [debtTokenInfo, setDebtTokenInfo] = useState<dTokenInfo>()
    const [maxAmount, setMaxAmount] = useState<BigNumber>();
    const { borrow, getDebtTokensInfo, getUserDebtSnapshot, getBorrowAmount } = useLend()

    const [accountSnapshot, setAccountSnapshot] = useState<{
        borrowedTokens: BigNumber;
        collateralizedTokens: BigNumber;
    }>()

    useEffect(() => {
        getDebtTokensInfo().then(balances => setDebtTokenInfo(balances[dToken]))
        getBorrowAmount({ dToken }).then(borrows => setMaxAmount(borrows))
    }, [])

    useEffect(() => {
        getUserDebtSnapshot(dToken).then(setAccountSnapshot)
    }, [getUserDebtSnapshot, setAccountSnapshot, dToken])

    return <BorrowTransactionComponentWrapper>
        <TransactionTitle>Repay Token</TransactionTitle>
        <TransactionDescription>In this transaction you will repay your {debtTokenInfo?.symbol ?? "XXX"} debt stop accumulating interest for the canceled debt.</TransactionDescription>
        <Balance>Your borrow is <Bold>{`~ ${accountSnapshot ? utils.formatEther(accountSnapshot.borrowedTokens) : "XXX"}`}</Bold> {debtTokenInfo?.symbol ?? "XXX"}</Balance>
        <Balance>In order to not overpass the recommended limit do not borrow more than <Bold>{maxAmount ? utils.formatEther(maxAmount) : "XXX"}</Bold> {debtTokenInfo?.symbol ?? "XXX"}</Balance>
        <Input type='string' value={amount} onChange={(ev) => setAmount(ev.target.value)} placeholder="Amount to be deposited" />
        <ExecutionButtonsWrapper>
            <PaddedButton disabled={(!isBigNumberish(amount) && !Number(amount))} onClick={() => borrow(dToken, utils.parseEther(amount))}>Execute</PaddedButton>
        </ExecutionButtonsWrapper>
    </BorrowTransactionComponentWrapper>
}