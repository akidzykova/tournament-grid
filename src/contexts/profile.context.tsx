import React from "react";
import type { UserData } from "~/server/common/common";

export interface ProfileContextData {
    userData?: UserData
}

export const ProfileContext = React.createContext<ProfileContextData>(
    null as unknown as ProfileContextData
)