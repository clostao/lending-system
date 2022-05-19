import { Button, Input } from "@mui/material"
import { utils } from "ethers"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { useLend } from "../../hooks/useLend"
import { dTokenInfo } from "../../types"

const MintTransactionComponentWrapper = styled.div`
    width: 30vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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

export const MintTransactionComponent = ({ dToken }: { dToken: string }) => {
    const [amount, setAmount] = useState<string>("0");
    const { mintDebtToken, getDebtTokensInfo } = useLend()
    const [debtTokenInfo, setDebtTokenInfo] = useState<dTokenInfo>()

    useEffect(() => {
        getDebtTokensInfo().then(balances => setDebtTokenInfo(balances[dToken]))
    }, [getDebtTokensInfo, setDebtTokenInfo, dToken])

    return <MintTransactionComponentWrapper>
        <TransactionTitle>Mint {debtTokenInfo?.symbol ?? 'XXX'}</TransactionTitle>
        <TransactionDescription>In this transaction you will deposit your Tokens in exchange for dTokens that you will be able to redeem for Tokens at any moment plus the earned interest.</TransactionDescription>
        <TransactionDescription>Before supplying your {debtTokenInfo?.name} you need to approve the lending system contracts move your funds.</TransactionDescription>
        Your balance is 1000 {debtTokenInfo?.name}
        <Input type='string' value={amount} onChange={(ev) => setAmount(ev.target.value)} placeholder="Amount to be deposited" />
        <ExecutionButtonsWrapper>
            <PaddedButton>Approve</PaddedButton>
            <PaddedButton onClick={() => mintDebtToken(dToken, utils.parseEther(amount))}>Execute</PaddedButton>
        </ExecutionButtonsWrapper>
    </MintTransactionComponentWrapper>
}