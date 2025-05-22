"use client";

import { forwardRef, type FormHTMLAttributes } from "react";
import styled from "styled-components";

interface UIFormProps extends FormHTMLAttributes<HTMLFormElement> {}

export const UIForm = forwardRef<HTMLFormElement, UIFormProps>(
    (props, ref) => {
        const {children, ...commonProps} = props

        return (
            <Form ref={ref} {...commonProps}> 
                {children}
            </Form>
        );
    }
)

UIForm.displayName = "UIForm"

const Form = styled.form`
    display: flex;
    flex-direction: column;
    row-gap: 24px;
    min-width: 400px;
`
