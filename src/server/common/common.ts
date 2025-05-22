import type {Organization, OrganizationRequest} from "@prisma/client";

export const JWT_SECRET = "so_secret_jwt_token_anyway"

export interface UserData {
    email: string;
    login: string;
    roles: string[];
}