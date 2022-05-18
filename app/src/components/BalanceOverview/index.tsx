import { FC } from "react";
import { BalanceOverview as LendingBalanceOverview } from '../../types'
import { Balance, BalanceOverviewWrapper, TokensNumber } from "./Styles";

type BalanceOverviewProps = { balanceOverview: LendingBalanceOverview, type: 'borrowed' | 'supplied' }

export const BalanceOverview: FC<BalanceOverviewProps> = ({ balanceOverview, type }: BalanceOverviewProps) => <BalanceOverviewWrapper>
    <TokensNumber>
        {balanceOverview.tokens.length} tokens {type}
    </TokensNumber>
    <Balance>
        Total value {type}: {balanceOverview.balance.toString()}
    </Balance>
</BalanceOverviewWrapper>