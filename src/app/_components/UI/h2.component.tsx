"use client";

import styled from "styled-components";

interface UIH2Props {
  children?: React.ReactNode;
}

export const UIH2 = ({ children }: UIH2Props) => {
  return <StyledH2>{children}</StyledH2>;
};

const StyledH2 = styled.h2`
    user-select: none;

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;

    color: white;
    font-size: 32px;
    font-weight: 600;
    margin: 0;
`;
