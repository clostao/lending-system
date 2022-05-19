import { Signer } from 'ethers';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil';
import { SignerState } from '../state';

export const useWallet = () => {

    const [signer, setSigner] = useRecoilState<{
        signer: Signer | undefined
    }>(SignerState);

    const [address, setAddress] = useState<string>();

    const metamask = useMemo(() => {
        return (window as any).ethereum
    }, [])

    const isMetamaskAvailable = useMemo(() => metamask?.isMetaMask, [metamask])

    const disconnect = useCallback(async () => {
        setSigner({ signer: undefined })
    }, [setSigner])

    const connect = useCallback(async () => {
        debugger
        const provider = new ethers.providers.Web3Provider(metamask)
        const [address] = await provider.send("eth_requestAccounts", [])
        setAddress(address)
        setSigner((st) => ({
            signer: provider.getSigner()
        }))
    }, [metamask, setSigner])

    const reconnect = useCallback(() => {
        disconnect().then(connect)
    }, [connect, disconnect])

    const provider = useMemo(() =>
        new ethers.providers.JsonRpcBatchProvider("http://localhost:7545"), [])

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
        signer: signer.signer,
        provider,
        connect,
        disconnect,
        reconnect
    }
}