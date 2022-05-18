import React, { FC } from 'react'
import styled from 'styled-components'

const HeaderContent = styled.div`
    background: white;
    display: flex;
    height: 5rem;
    width: 100%;
    border-bottom: solid black 0.5rem;
    border-bottom-right-radius: 1rem;
    border-bottom-left-radius: 1rem;
`

const BlackDiv = styled.div`
    background: black;
`

export const HeaderWrapper: FC<React.PropsWithChildren<any>> = ({ children }) => <BlackDiv><HeaderContent>{children}</HeaderContent></BlackDiv>

export const HeaderInfo = styled.div`
    display: flex;
    align-items: center;
    padding: 1rem;
    flex: 1;
`

export const HeaderTitle = styled.div`
    font-size: x-large;
    font-weight: 600;
`

export const HeaderPlaceholder = styled.div`
    margin-left: 1rem;
    font-size: small;
    font-weight: 300;
`

export const ConnectionInfo = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 1rem;
    flex: 1;
`

export const Address = styled.span`
    color: white;
    background: black;
    border-radius: 0.5rem;
    padding: 0.5rem;
`

export const ConnectButton = styled(Address)`
    &:hover {
        cursor: pointer;
    }
`

export const DisabledConnectButton = styled(ConnectButton)`
    opacity: 0.7;
`