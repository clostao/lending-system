export interface LendContractsConfig {
    controller: string;
    tokens: {
        underlying: string;
        debt: string;
    }[];
}


export const Contracts: LendContractsConfig = {
    "controller": "0x42E3A9B9511287F5D2c2dd09cB4Ed29e435A284B",
    "tokens": [
        {
            "underlying": "0x22809A0a7cbE1bA81B629437c41f6E1B508a65B6",
            "debt": "0xA70485BEc4927FAe3B5af75f84B94C150F0f4136"
        },
        {
            "underlying": "0x25879e82fF60eDCe60EF970e8f964E322222d86c",
            "debt": "0x33A9D08652B99cFC4e43fa844017b62c7eb5b3c7"
        }
    ]
}