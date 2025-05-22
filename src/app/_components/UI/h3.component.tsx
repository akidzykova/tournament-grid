"use client";

import styled from "styled-components";

interface UIH3Props {
  children?: React.ReactNode;
}

export const UIH3 = ({ children }: UIH3Props) => {
  return <StyledH3>{children}</StyledH3>;
};

const StyledH3 = styled.h3`
    user-select: none;

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;


    color: white;
    font-size: 28px;
    font-weight: 600;
    margin: 0;
`;
