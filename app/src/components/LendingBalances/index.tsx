import { BigNumber } from "ethers";
import { FC } from "react";
import { BalanceOverview } from "../BalanceOverview";
import { BalanceOverviewTitle, LendingBalancesWrapper } from './Styles'

export const LendingBalances: FC = () => {

    return <LendingBalancesWrapper>
        <BalanceOverviewTitle>
            Borrows:
        </BalanceOverviewTitle>
        <BalanceOverview balanceOverview={{ tokens: [], balance: BigNumber.from(0) }} type='borrowed' />
        <BalanceOverviewTitle>
            Supplies:
        </BalanceOverviewTitle>
        <BalanceOverview balanceOverview={{ tokens: [], balance: BigNumber.from(0) }} type='supplied' />
    </LendingBalancesWrapper>;
}