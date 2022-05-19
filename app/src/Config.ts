export interface LendContractsConfig {
    controller: string;
    tokens: {
        underlying: string;
        debt: string;
    }[];
}


export const Contracts: LendContractsConfig = {
    "controller": "0xf2f4e6F17F2E39260bA034f1B5003d6f120a6c59",
    "tokens": [
        {
            "underlying": "0x82382322893cc24379d24aFbCe05C7c714C5aeDA",
            "debt": "0x15813C278920B143528f20cF0F458E2042Bd00D6"
        },
        {
            "underlying": "0xeC4629929c127143E2447cEf99a159DE10538afe",
            "debt": "0x87984B3f6bf1AEd26e3cE6C2F98B4B0355837cdD"
        }
    ]
}