import { Box, Modal } from "@mui/material"
import { FC, PropsWithChildren } from "react"
import styled from "styled-components"

const TransactionOverviewWrapper = styled(Box)`
    margin: auto;
    position: absolute;
    top: 0; 
    left: 0; 
    bottom: 0; 
    right: 0;
    width: fit-content;
    height: fit-content;
    padding: 1rem;
    background: white;
`

export const TransactionOverview: FC<PropsWithChildren<{ open: boolean, onClose: (...args: any[]) => any }>> = ({ children, open, onClose }) => {
    return <Modal open={open} onClose={onClose}>
        <TransactionOverviewWrapper>
            {children}
        </TransactionOverviewWrapper>
    </Modal>
}