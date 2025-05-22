import React, { useState } from 'react';
import type {
  Notification,
  NotificationTypeEnum,
} from "~/app/notification/types";
import {NotificationContext} from "./notification.context";
import {NotificationContainer} from "./notification-container.component";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (message: string, type: NotificationTypeEnum, durationMs = 10_000) => {
        const id = Date.now().toString();
        const newNotification: Notification = { id, message, type, durationMs };
        setNotifications((prev) => [...prev, newNotification]);

        setTimeout(() => removeNotification(id), durationMs);
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
            <NotificationContainer notifications={notifications} />
        </NotificationContext.Provider>
    );
};
