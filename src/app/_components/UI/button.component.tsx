import React, { forwardRef, type ButtonHTMLAttributes } from "react";
import styled from "styled-components";

export const UIButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => {
        const {children, ...commonProps} = props

        return (
            <Button ref={ref} {...commonProps}>
                {children}
            </Button>
        );
    }
)

UIButton.displayName = "UIButton"

const Button = styled.button`
    font-family: inherit;
    background-color: #FF6600;
    border: none;
    outline: none;
    font-size: 16px;
    padding: 18px;
    width: 100%;
    font-weight: 600;
    cursor: pointer;
    color: white;

    transition: 0.3s background-color;

    &:hover {
        background-color: rgb(193, 77, 0);
        transition: 0.3s background-color;
    }

    &:disabled {
        cursor: default;
        color: #d5d5d5;
        background-color: rgb(175, 87, 29);
    }
`