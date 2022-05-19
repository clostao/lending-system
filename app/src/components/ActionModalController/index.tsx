import { FC } from "react";
import { Action } from "../../types";
import { TransactionOverview } from "../TransactionOverview";
import { BorrowTransactionComponent } from "./BorrowTransactionComponent";
import { MintTransactionComponent } from "./MintTransactionComponent";
import { RedeemTransactionComponent } from "./RedeemTransactionComponent";
import { RepayTransactionComponent } from "./RepayTransactionComponent";





const componentsByAction: Record<Action, FC<{ dToken: string }>> = {
    'borrow': BorrowTransactionComponent,
    'repay': RepayTransactionComponent,
    'mint': MintTransactionComponent,
    'redeem': RedeemTransactionComponent,
}

export const ActionModalController: FC<{ action?: Action | undefined, dToken: string, onClose: (...args: any[]) => any }> = ({ action, dToken, onClose }) => {
    if (action === undefined) return <></>

    const Component = componentsByAction[action]
    return <TransactionOverview open={action !== undefined} onClose={onClose}>
        {Component({ dToken })}
    </TransactionOverview>
}