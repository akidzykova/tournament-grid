import styled, {css} from "styled-components";
import {Icon, type IconProps} from "~/app/_components/UI/icon.component";
import React, {useCallback} from "react";

export interface IconButtonProps extends IconProps {
    disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = (props) => {
    const { disabled, onClick, ...rest } = props;

    const handleClick: React.MouseEventHandler<HTMLSpanElement> = useCallback((event) => {
        if (disabled) {
          return;
        }
        
        onClick?.(event)
    }, [disabled, onClick])

    return (
        <StyledIconButton {...rest} onClick={handleClick} disabled={disabled} />
    );
};

const StyledIconButton = styled(Icon)<{ disabled?: boolean }>`
    color: #cacaca;

    &:hover {
        cursor: pointer;
        color: white;
    }
    
    ${({ disabled }) => disabled && css`
        color: #acacac !important;

        &:hover {
            cursor: default;
        }
    `}
`
