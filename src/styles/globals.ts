"use client";

import { createGlobalStyle } from "styled-components";

const BACKGROUND_COLOR = '#0A0A0C'

export const GlobalStyle = createGlobalStyle`
  body {
    padding: 0;
    margin: 0;
    font-family: var(--font-montserrat);
    font-weight: 600;
    background-color: ${BACKGROUND_COLOR};
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    margin: 0;
    box-sizing: border-box;
  }
`