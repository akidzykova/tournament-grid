import React, { useCallback } from "react";
import styled from "styled-components";
import { UIH1 } from "~/app/_components/UI/h1.component";
import { api } from "~/trpc/react";
import { Loader } from "~/app/_components/loader.component";
import { IconButton } from "~/app/_components/UI/icon-button.component";
import { IconEnum } from "~/app/_components/UI/icon.component";
import {UIP} from "~/app/_components/UI/p.component";

export const NotificationsProfile: React.FC = () => {
  const notificationGetQuery = api.notification.get.useQuery({
    skip: 0,
    take: 50,
  });

  const refresh = useCallback(() => {
    void notificationGetQuery.refetch();
  }, [notificationGetQuery]);

  return (
    <Wrapper>
      <UIH1>
        Уведомления{" "}
        <IconButton size={24} icon={IconEnum.REFRESH} onClick={refresh} />
      </UIH1>
      <NotificationsList>
        {notificationGetQuery.isLoading || notificationGetQuery.isRefetching ? (
          <Loader type="fluid" />
        ) : notificationGetQuery.data && notificationGetQuery.data.length > 0 ? (
          notificationGetQuery.data.map((n) => (
            <NotificationCard key={n.id}>
              <Title>{n.title}</Title>
              <Text>{n.text}</Text>
              <Date>{n.createAt.toLocaleString()}</Date>
            </NotificationCard>
          ))
        ) : <UIP>Уведомлений пока нет</UIP>}
      </NotificationsList>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  color: white;
`;

const NotificationsList = styled.div`
  margin-top: 24px;

  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NotificationCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  background: transparent;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #1c1c1c;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 8px;
`;

const Text = styled.div`
  font-size: 16px;
  color: #888;
`;

const Date = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  font-size: 14px;
  font-weight: lighter;

  color: #888;
  margin-top: 8px;
`;

const Loading = styled.div`
  padding: 16px;
  text-align: center;
  color: #aaa;
`;
