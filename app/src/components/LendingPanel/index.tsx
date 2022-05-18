import { LendingPanelColumn, LendingPanelColumnHeader, LendingPanelRow, LendingPanelWrapper } from "./Styles"

export const LendingPanel = () => {
    return <LendingPanelWrapper>
        <LendingPanelRow>
            <LendingPanelColumnHeader>Token</LendingPanelColumnHeader>
            <LendingPanelColumnHeader>Supplied</LendingPanelColumnHeader>
            <LendingPanelColumnHeader>Borrowed</LendingPanelColumnHeader>
            <LendingPanelColumnHeader>Your supply</LendingPanelColumnHeader>
            <LendingPanelColumnHeader>Your borrows</LendingPanelColumnHeader>
            <LendingPanelColumnHeader>Actions</LendingPanelColumnHeader>
        </LendingPanelRow>
        <LendingPanelRow>
            <LendingPanelColumn>ETH</LendingPanelColumn>
            <LendingPanelColumn>5000 ETH</LendingPanelColumn>
            <LendingPanelColumn>1300 ETH</LendingPanelColumn>
            <LendingPanelColumn>20 ETH</LendingPanelColumn>
            <LendingPanelColumn>0 ETH</LendingPanelColumn>
            <LendingPanelColumn>Actions</LendingPanelColumn>
        </LendingPanelRow>
    </LendingPanelWrapper>
}