"use client";

import styled from "styled-components";

interface UIH1Props {
    children?: React.ReactNode;
}

export const UIH1 = (
    {
        children
    }: UIH1Props
) => {
    return <StyledH1>{children}</StyledH1>
}

const StyledH1 = styled.h1`
    color: white;
    font-size: 48px;
    font-weight: 600;
    margin: 0;
`