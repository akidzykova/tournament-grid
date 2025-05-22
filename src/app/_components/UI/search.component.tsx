"use client";

import styled from "styled-components";

interface UISearchProps {
    placeholder?: string,
    value?: string,
}

export const UISearch = (
    {
        placeholder = "Поиск",
        value
    }: UISearchProps
) => {
    return (
        <Wrapper>
            <Input placeholder={placeholder} type="text">
            </Input>
            <img src="UI/search.svg" alt='search'/>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 16px;
    background-color: #111115;
    justify-content: space-between;
`

const Input = styled.input`
    font-family: inherit;
    background-color: transparent;
    outline: none;
    border: none;
    font-size: 16px;
    font-weight: 400;
    color: white;
`

