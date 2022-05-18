import { FC, PropsWithChildren } from "react";
import styled from "styled-components";

const MiddleFrameWrapper = styled.div`
    margin-top: 5rem;
    display: flex;
    justify-content: center;
    align-items: center;
`

const InnerMiddleframe = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 80%;
    > * {
        margin-bottom: 2rem;
    }
`

export const Middleframe: FC<PropsWithChildren<{}>> = ({ children }) => <MiddleFrameWrapper>
    <InnerMiddleframe>
        {children}
    </InnerMiddleframe>
</MiddleFrameWrapper>