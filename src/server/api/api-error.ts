import {type ApiErrorCodeEnum} from "~/server/api/api-error-code.enum";

export class ApiError extends Error {
    public readonly code: ApiErrorCodeEnum;
    
    public constructor(code: ApiErrorCodeEnum) {
        super();
        this.code = code;
    }
}