import { FC } from "react";
import { useWallet } from "../../hooks/useWallet";
import { Address, ConnectButton, ConnectionInfo, HeaderInfo, HeaderPlaceholder, HeaderTitle, HeaderWrapper } from './Styles'

export const Header: FC = () => {
    const { isMetamaskAvailable, signer, address, connect, disconnect } = useWallet()
    return <HeaderWrapper>
        <HeaderInfo>
            <HeaderTitle>
                Lending System
            </HeaderTitle>
            <HeaderPlaceholder>
                By Carlos Lostao
            </HeaderPlaceholder>
        </HeaderInfo>
        <ConnectionInfo>
            {signer ? <Address onClick={disconnect}>{address}</Address> : (isMetamaskAvailable ? <ConnectButton onClick={connect}>Connect</ConnectButton> : <ConnectButton>MetaMask is not available =(</ConnectButton>)}
        </ConnectionInfo>
    </HeaderWrapper>
}