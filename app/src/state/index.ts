import { Signer } from "ethers";
import { atom } from "recoil";

export const SignerState = atom<{ signer: Signer | undefined, address?: string }>({
    key: 'Signer',
    dangerouslyAllowMutability: true,
    default: { signer: undefined },
});