export enum NotificationTypeEnum {
    INFO,
    SUCCESS,
    ERROR,
}

export interface Notification {
    id: string;
    message: string;
    type: NotificationTypeEnum;
    durationMs?: number;
}
