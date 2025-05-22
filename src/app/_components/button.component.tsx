"use client";

import styled from "styled-components";

interface ButtonProps {
    children: React.ReactNode
}

export const ButtonComponent = ({children}: ButtonProps) => {
    return <ButtonStyle>{children}</ButtonStyle>
}

const ButtonStyle = styled.button`
    background-color: #FF6600;
    outline: none;
    border: none;
    color: white;
    font-size: 24px;
    font-weight: 600;
    padding: 24px 86px;

    transition: 0.3s background-color;

    cursor: pointer;

    &:hover{
        background-color: rgb(193, 77, 0);
        transition: 0.3s background-color;
    }
`