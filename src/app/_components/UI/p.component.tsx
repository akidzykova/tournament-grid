"use client";

import styled from "styled-components";
import React, {type ButtonHTMLAttributes, forwardRef} from "react";

export const UIP = forwardRef<HTMLParagraphElement, ButtonHTMLAttributes<HTMLParagraphElement>>(
    (props, ref) => {
      const {children, ...commonProps} = props

      return (
          <StyledP ref={ref} {...commonProps}>
            {children}
          </StyledP>
      );
    }
)

UIP.displayName = "UIP"

const StyledP = styled.p`
  display: inline;
  
  color: #e6e6e6;
  font-size: 18px;
  font-weight: normal;
  margin: 0;
`;
