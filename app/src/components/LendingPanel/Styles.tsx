import styled from "styled-components";

export const LendingPanelWrapper = styled.div`
    border: 1px solid black;
    border-radius: 1rem;
    display: flex;
    width: 90%;
    flex-direction: column;
`

export const LendingPanelRow = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-around;
    padding: 1rem;
`


export const LendingPanelColumn = styled.div`
    padding: 0.2rem;
    flex: 1;
    text-align: center;
`

export const LendingPanelColumnHeader = styled(LendingPanelColumn)`
    & + & {
        border-left: 2px solid #00000099;
    }
`