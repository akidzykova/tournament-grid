"use client";

import styled, { keyframes } from "styled-components";
import React from "react";

interface LoaderProps {
    type?: 'overlay' | 'fluid' | 'inline'
}

export const Loader: React.FC<LoaderProps> = (props) => {
    const { type = 'overlay' } = props;

    switch (type) {
        case 'overlay': {
            return (
                <Overlay>
                    <Spinner />
                </Overlay>
            );
        }
        case 'fluid': {
            return (
                <Container>
                    <Spinner />
                </Container>
            );
        }
        case 'inline': {
            return (
                <Spinner />
            );
        }
    }
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: #0a0a0c;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;


const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.span`
  border: 6px solid #333;
  border-top: 6px solid #ff6600;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;
