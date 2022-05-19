export interface LendContractsConfig {
    controller: string;
    tokens: {
        underlying: string;
        debt: string;
    }[];
}


export const Contracts: LendContractsConfig = {
    "controller": "0x20cAFbeDb2B54072E8D8501dbEB3Ef7E0cA5595C",
    "tokens": [
        {
            "underlying": "0x20C03C0568078c4fa8217691fBc0a08DB7f2c486",
            "debt": "0xb157720344196869ace19830346AE11e57a6b013"
        },
        {
            "underlying": "0x81c8D46f189CbbE066bAA3364310Cbb707a9c427",
            "debt": "0xA70f02F55BC34e89eAeDdBc581a525b63dCD67d3"
        }
    ]
}