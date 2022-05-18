import React, { FC } from "react";
import styled from "styled-components";

const HomeCardWrapper = styled.div`
    border-radius: 1rem;
    border: 1px solid black;
    padding: 1rem;
`

export const HomeCard: FC<React.PropsWithChildren<any>> = ({ children }) => {
    return <HomeCardWrapper><p>
        This lending system has been developed in solidity thus it could be deployed in any EVM-compatible network.
    </p>
        <p>
            As any other lending system it is composed by borrowers and lenders. Additionally, a new agent comes out from the decentralization of this sort of system and it is the liquidator. The liquidator is the entity that should monitor the state of all the borrowers, and liquidate their positions in case of the borrower balance overpass certain threshold.
        </p></HomeCardWrapper>
}