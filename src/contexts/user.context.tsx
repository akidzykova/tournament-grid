import React from "react"
import type { UserData } from "~/server/common/common"

export interface UserContextData {
    userData?: UserData,
    token: string | null,
    setToken: (token: string) => void,
    setUserData: (user: UserData | undefined) => void
}

export const UserContext = React.createContext<UserContextData>(
    null as unknown as UserContextData
)