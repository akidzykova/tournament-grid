import React from 'react';
import styled, {css, keyframes} from 'styled-components';
import {type Notification, NotificationTypeEnum} from "~/app/notification/types";

interface NotificationContainerProps {
    notifications: Notification[]
}

export const NotificationContainer: React.FC<NotificationContainerProps> = (props) => {
    return (
        <Wrapper>
            {props.notifications.map(notification => (
                <NotificationBox key={notification.id} type={notification.type}>
                    {notification.message}
                </NotificationBox>
            ))}
        </Wrapper>
    )
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div`
    position: fixed;
    bottom: 20px;
    left: 20px;
    display: flex;
    flex-direction: column-reverse;
    gap: 12px;
    z-index: 10000;
`;

const NotificationBox = styled.div<{ type: NotificationTypeEnum }>`
    background: #0C0C0F;
    box-shadow: 0 0 8px 1px rgba(81, 81, 81, 0.5);
    
    color: white;
    padding: 14px 20px;
    border-radius: 6px;
    font-size: 14px;
    animation: ${fadeIn} 0.3s ease;
    min-width: 250px;
    max-width: 350px;
    
    ${({ type }) => {
        switch (type) {
            case NotificationTypeEnum.SUCCESS: {
                return css`
                    border-left: 4px solid #28a745
                `
            }
            case NotificationTypeEnum.INFO: {
                return css`
                    border-left: 4px solid #2876a7
                `
            }
            case NotificationTypeEnum.ERROR: {
                return css`
                    border-left: 4px solid #dc3545
                `
            }
        }
    }}
`;