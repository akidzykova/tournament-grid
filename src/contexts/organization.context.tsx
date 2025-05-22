import React from "react";
import type {Organization, OrganizationRequest} from "@prisma/client";

type OrganizationState =
    {
        type: 'loading'
    } |
    {
        type: 'none'
    } |
    {
        type: 'request',
        data: OrganizationRequest
    } |
    {
        type: 'exist';
        organization: Organization
    }

export interface OrganizationContextData {
    state: OrganizationState;
}

export const OrganizationContext = React.createContext<OrganizationContextData>(
    null as unknown as OrganizationContextData
)