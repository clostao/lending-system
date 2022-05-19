import { ethers } from "ethers";
import { atom } from "recoil";

export const SignerState = atom<{ signer: ethers.Signer | undefined }>({
    key: 'Signer',
    dangerouslyAllowMutability: true,
    default: { signer: undefined },
});