import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { UIH1 } from "~/app/_components/UI/h1.component";
import { api } from "~/trpc/react";
import { formatEventDate } from "~/utils/date";
import { Modal } from "~/app/_components/modal.component";
import { UIH3 } from "~/app/_components/UI/h3.component";
import { UIButton } from "~/app/_components/UI/button.component";
import { useNotifications } from "~/app/notification/use-notifications.hook";
import { NotificationTypeEnum } from "~/app/notification/types";
import { IconButton } from "~/app/_components/UI/icon-button.component";
import { IconEnum } from "~/app/_components/UI/icon.component";
import { Loader } from "~/app/_components/loader.component";
import { UIP } from "~/app/_components/UI/p.component";

enum Tab {
  ORGANIZATION_REQUESTS,
}

export const AdminProfile: React.FC = () => {
  const [tab, setTab] = useState<Tab>(Tab.ORGANIZATION_REQUESTS);
  const content = useMemo(() => {
    switch (tab) {
      case Tab.ORGANIZATION_REQUESTS: {
        return <OrganizationRequests />;
      }
    }
  }, [tab]);

  return (
    <>
      <Section>
        <NavButton
          active={tab === Tab.ORGANIZATION_REQUESTS}
          onClick={() => setTab(Tab.ORGANIZATION_REQUESTS)}
        >
          Заявки на организацию
        </NavButton>
      </Section>

      {content}
    </>
  );
};

const Section = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 32px;

  border-radius: 8px;

  background: #111115;

  width: 100%;
  padding: 16px 24px;
`;

const NavButton = styled.div<{ active: boolean }>`
  user-select: none;

  padding: 16px;

  font-size: 16px;

  color: #d3d3d3;
  background-color: #ff6600;

  border-radius: 2px;

  &:hover {
    cursor: pointer;

    color: #f1f1f1;
    background-color: rgb(225, 91, 0);
  }

  ${({ active }) =>
    active &&
    css`
      color: #ffffff;
      background-color: #ff6600 !important;

      &:hover {
        cursor: default;
      }
    `}
`;

const OrganizationRequests: React.FC = () => {
  const { addNotification } = useNotifications();

  const inviteGetQuery = api.organizationRequests.get.useQuery({
    skip: 0,
    take: 50,
  });

  const [showModal, setShowModal] = React.useState(false);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const [inviteId, setInviteId] = React.useState<string | null>(null);

  const handleCardClick = useCallback((id: string) => {
    setInviteId(id);
    setShowModal(true);
  }, []);

  const inviteAcceptMutation = api.organizationRequests.accept.useMutation();
  useEffect(() => {
    if (inviteAcceptMutation.isError) {
      addNotification("Произошла ошибка", NotificationTypeEnum.ERROR);
    }
  }, [inviteAcceptMutation.isError]);

  useEffect(() => {
    if (inviteAcceptMutation.isSuccess) {
      addNotification(
        "Приглашение успешно принято",
        NotificationTypeEnum.SUCCESS,
      );
      void inviteGetQuery.refetch();
      setShowModal(false);
    }
  }, [inviteAcceptMutation.isSuccess]);

  const handleAcceptInvite = useCallback(() => {
    if (inviteId == null) {
      return;
    }

    inviteAcceptMutation.mutate({
      id: inviteId,
    });
  }, [inviteAcceptMutation, inviteId]);

  const inviteRejectMutation = api.organizationRequests.reject.useMutation();
  useEffect(() => {
    if (inviteRejectMutation.isError) {
      addNotification("Произошла ошибка", NotificationTypeEnum.ERROR);
    }
  }, [inviteRejectMutation.isError]);

  useEffect(() => {
    if (inviteRejectMutation.isSuccess) {
      addNotification(
        "Приглашение успешно отклонено",
        NotificationTypeEnum.SUCCESS,
      );
      void inviteGetQuery.refetch();
      setShowModal(false);
    }
  }, [inviteRejectMutation.isSuccess]);

  const handleRejectInvite = useCallback(async () => {
    if (inviteId == null) {
      return;
    }

    await inviteRejectMutation.mutateAsync({
      id: inviteId,
    });
  }, [inviteId, inviteRejectMutation]);

  const refresh = useCallback(() => {
    void inviteGetQuery.refetch();
  }, [inviteGetQuery]);

  return (
    <>
      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <ModalContent>
          <UIH3>Приглашение</UIH3>
          <UIButton onClick={handleAcceptInvite}>Принять</UIButton>
          <UIButton onClick={handleRejectInvite}>Отклонить</UIButton>
        </ModalContent>
      </Modal>
      <Wrapper>
        <UIH1>
          Заявки на организации{" "}
          <IconButton size={24} icon={IconEnum.REFRESH} onClick={refresh} />
        </UIH1>
        {inviteGetQuery.isLoading || inviteGetQuery.isRefetching ? (
          <Loader type="fluid" />
        ) : (
          <NotificationsList>
            {inviteGetQuery.data && inviteGetQuery.data.length > 0 ? (
              inviteGetQuery.data.map((invite) => (
                <InviteCard
                  key={invite.id}
                  onClick={() => handleCardClick(invite.id)}
                >
                  <Title>
                    Организация &#34;{invite.name}&#34; от пользователя &#34;
                    @{invite.user.login}&#34;
                  </Title>
                  <Date>{invite.requestedAt.toLocaleString()}</Date>
                </InviteCard>
              ))
            ) : (
              <UIP>Приглашений пока нет</UIP>
            )}
          </NotificationsList>
        )}
      </Wrapper>
    </>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;

  gap: 24px;
`;

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

const InviteCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  background: transparent;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #1c1c1c;

  &:hover {
    cursor: pointer;
    background: #1c1c1c;
  }
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
