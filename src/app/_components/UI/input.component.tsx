"use client";

import React, { forwardRef, type InputHTMLAttributes } from "react";
import styled from "styled-components";

interface UIInputProps extends InputHTMLAttributes<HTMLInputElement> {
    header?: string;
    errorText?: string | null;
}

export const UIInput = forwardRef<HTMLInputElement, UIInputProps> (
    (props, ref) => {
        const {header, errorText, ...commonProps} = props

        return (
            <Wrapper>
                {
                    header ?
                        <Header>
                            {header.toUpperCase()}
                        </Header> :
                        null
                }
                {
                    errorText ?
                        <ErrorText>
                            {errorText}
                        </ErrorText> :
                        null
                }
                <Input ref={ref} {...commonProps} />
            </Wrapper>
        );
    }
)

UIInput.displayName = "UIInput"

const Wrapper = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 8px;

    & p {
        margin: 0;
    }
`

const Header = styled.p`
    font-family: inherit;
    font-size: 12px;
    color: white;
    font-weight: 700;
`

const ErrorText = styled.p`
    font-family: inherit;
    font-size: 10px;
    color: #ff2848;
    font-weight: 700;
`

const Input = styled.input`
    font-family: inherit;
    background-color: #111115;
    outline: none;
    border: none;
    font-size: 16px;
    font-weight: 400;
    padding: 16px;
    color: white;
    width: 100%;
    height: 100%;
`