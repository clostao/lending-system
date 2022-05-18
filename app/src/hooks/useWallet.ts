import { ethers, providers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react'

export const useWallet = () => {

    const [signer, setSigner] = useState<providers.JsonRpcSigner>();

    const [address, setAddress] = useState<string>();

    const metamask = useMemo(() => {
        return (window as any).ethereum
    }, [])

    const isMetamaskAvailable = useMemo(() => metamask?.isMetaMask, [metamask])

    const disconnect = useCallback(async () => {
        setSigner(undefined)
    }, [setSigner])

    const connect = useCallback(async () => {
        const provider = new ethers.providers.Web3Provider(metamask)
        const [address] = await provider.send("eth_requestAccounts", [])
        setAddress(address)
        setSigner(provider.getSigner())
    }, [metamask])

    const reconnect = useCallback(() => {
        disconnect().then(connect)
    }, [connect, disconnect])


    useEffect(() => {
        if (!signer) { setAddress(undefined) }
    }, [signer])

    useEffect(() => {
        metamask.on("disconnect", disconnect)
        metamask.on("accountsChanged", disconnect)
        return () => {
            metamask.off("disconnect", disconnect)
            metamask.off("accountsChanged", disconnect)
        }
    }, [metamask, disconnect])

    return {
        isMetamaskAvailable,
        address,
        signer,
        connect,
        disconnect,
        reconnect
    }
}