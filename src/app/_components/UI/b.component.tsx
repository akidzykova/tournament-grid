"use client";

import styled from "styled-components";
import React, {type ButtonHTMLAttributes, forwardRef} from "react";
import {UIP} from "~/app/_components/UI/p.component";

export const UIBold = forwardRef<HTMLParagraphElement, ButtonHTMLAttributes<HTMLParagraphElement>>(
    (props, ref) => {
      const {children, ...commonProps} = props

      return (
          <StyledP ref={ref} {...commonProps}>
            {children}
          </StyledP>
      );
    }
)

UIBold.displayName = "UIBold"

const StyledP = styled(UIP)`
  font-weight: bold;
`;
