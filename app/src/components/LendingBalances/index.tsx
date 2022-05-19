import { BigNumber } from "ethers";
import { FC } from "react";
import { BalanceOverview } from "../BalanceOverview";
import { LendingBalancesWrapper } from './Styles'

export const LendingBalances: FC = () => {

    return <LendingBalancesWrapper>
        <BalanceOverview balanceOverview={{ tokens: [], balance: BigNumber.from(0) }} type='borrowed' />
        <BalanceOverview balanceOverview={{ tokens: [], balance: BigNumber.from(0) }} type='supplied' />
    </LendingBalancesWrapper>;
}