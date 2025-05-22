import React from "react"

export interface AuthorizationFormContextData {
    isAuthenticationFormState: boolean
    setAuthenticationFormState: (isAuthenticationForm: boolean) => void
}

export const AuthorizationFormContext = React.createContext<AuthorizationFormContextData>(
    null as unknown as AuthorizationFormContextData
)