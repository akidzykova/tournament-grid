import {createContext} from "react";
import type {Notification, NotificationTypeEnum} from "~/app/notification/types";

export interface NotificationContextData {
    notifications: Notification[];
    addNotification: (message: string, type: NotificationTypeEnum, durationMs?: number) => void;
    removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextData | undefined>(undefined);