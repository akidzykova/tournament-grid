import { useRouter } from "next/router";
import { api } from "~/trpc/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UIH1 } from "~/app/_components/UI/h1.component";
import styled, { css } from "styled-components";
import { UIH2 } from "~/app/_components/UI/h2.component";
import { UIH3 } from "~/app/_components/UI/h3.component";
import { UIP } from "~/app/_components/UI/p.component";
import { formatEventDate } from "~/utils/date";
import { Loader } from "~/app/_components/loader.component";
import { UIBold } from "~/app/_components/UI/b.component";
import { IconEnum } from "~/app/_components/UI/icon.component";
import { IconButton } from "~/app/_components/UI/icon-button.component";
import { UIInput } from "~/app/_components/UI/input.component";
import { Modal } from "~/app/_components/modal.component";
import { UIButton } from "~/app/_components/UI/button.component";
import { SingleEliminationBracket } from "~/app/_components/UI/signle-elimination-bracket";
import { useNotifications } from "~/app/notification/use-notifications.hook";
import { NotificationTypeEnum } from "~/app/notification/types";
import { MatchStatus, MemberRole } from "@prisma/client";
import type { Bracket } from "~/utils/generate-bracket";

enum Tab {
  INFORMATION,
  PARTICIPANTS,
  INVITES,
}

export default function MatchPage() {
  const router = useRouter();
  const { id } = router.query;

  const matchGetQuery = api.match.getMatch.useQuery({
    id: id as string,
  });

  const meOrganizationMemberQuery =
    api.organization.getMeOrganizationMember.useQuery();

  const hasPermissions = useMemo(() => {
    return (
      meOrganizationMemberQuery.data &&
      (meOrganizationMemberQuery.data.role === MemberRole.ADMIN ||
        meOrganizationMemberQuery.data.role === MemberRole.MODERATOR)
    );
  }, [meOrganizationMemberQuery.data]);

  const [tab, setTab] = useState<Tab>(Tab.INFORMATION);
  const content = useMemo(() => {
    switch (tab) {
      case Tab.INFORMATION: {
        return <InformationContent />;
      }
      case Tab.PARTICIPANTS: {
        return <ParticipantsContent />;
      }
      case Tab.INVITES: {
        return <InvitesContent />;
      }
    }
  }, [tab]);

  if (matchGetQuery.data == null || meOrganizationMemberQuery.isLoading) {
    return <Loader />;
  }

  return (
    <Wrapper>
      <UIH1>
        <span>Матч </span>
        <OrganizationText>&#34;{matchGetQuery.data.name}&#34;</OrganizationText>
      </UIH1>
      <Section>
        <NavButton
          active={tab === Tab.INFORMATION}
          onClick={() => setTab(Tab.INFORMATION)}
        >
          Информация
        </NavButton>
        <NavButton
          active={tab === Tab.PARTICIPANTS}
          onClick={() => setTab(Tab.PARTICIPANTS)}
        >
          Участники
        </NavButton>
        {hasPermissions &&
          matchGetQuery.data.participants.length <
            matchGetQuery.data.participantsCount && (
            <NavButton
              active={tab === Tab.INVITES}
              onClick={() => setTab(Tab.INVITES)}
            >
              Приглашения
            </NavButton>
          )}
      </Section>
      {content}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 24px;

  padding: 0 56px;
`;

const OrganizationText = styled.span`
  color: #cfcfcf;
  font-weight: lighter;
`;

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

const InformationContent: React.FC = () => {
  const { addNotification } = useNotifications();

  const router = useRouter();
  const { id } = router.query;

  const matchGetQuery = api.match.getMatch.useQuery({
    id: id as string,
  });

  const meOrganizationMemberQuery =
    api.organization.getMeOrganizationMember.useQuery();

  const hasPermissions = useMemo(() => {
    return (
      meOrganizationMemberQuery.data &&
      (meOrganizationMemberQuery.data.role === MemberRole.ADMIN ||
        meOrganizationMemberQuery.data.role === MemberRole.MODERATOR)
    );
  }, [meOrganizationMemberQuery.data]);

  const [editedMathName, setEditedMathName] = useState<string>();
  const [editedMaxParticipant, setEditedMaxParticipant] = useState<number>();
  const [editedCategory, setEditedCategory] = useState<string>();
  const [editedGender, setEditedGender] = useState<string>();

  const [editMode, setEditMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  const handleSaveChanges = useCallback(() => {
    setShowEditModal(false);
    setEditMode(false);
  }, []);

  const handleDiscardChanges = useCallback(() => {
    setEditedMathName("");
    setEditedMaxParticipant(0);
    setEditedCategory("");
    setEditedGender("");

    setShowEditModal(false);
    setEditMode(false);
  }, []);

  const handleSwitchEditMode = useCallback(() => {
    if (matchGetQuery.data == null) {
      return;
    }

    if (
      editMode &&
      (matchGetQuery.data.name !== editedMathName ||
        matchGetQuery.data.participantsCount !== editedMaxParticipant ||
        matchGetQuery.data.category !== editedCategory ||
        matchGetQuery.data.gender !== editedGender)
    ) {
      setShowEditModal(true);
      return;
    }

    if (!editMode) {
      setEditedMathName(matchGetQuery.data.name);
      setEditedMaxParticipant(matchGetQuery.data.participantsCount);
      setEditedCategory(matchGetQuery.data.category);
      setEditedGender(matchGetQuery.data.gender);
    }

    setEditMode((value) => !value);
  }, [
    editMode,
    editedCategory,
    editedGender,
    editedMathName,
    editedMaxParticipant,
    matchGetQuery.data,
  ]);

  const singleEliminationBracketMutation =
    api.match.singleEliminationBracketMutation.useMutation();

  useEffect(() => {
    if (singleEliminationBracketMutation.isError) {
      addNotification("Произошла ошибка", NotificationTypeEnum.ERROR);
    }
  }, [singleEliminationBracketMutation.isError]);

  useEffect(() => {
    if (singleEliminationBracketMutation.isSuccess) {
      addNotification("Изменения сохранены", NotificationTypeEnum.SUCCESS);
      void matchGetQuery.refetch();
    }
  }, [singleEliminationBracketMutation.isSuccess]);

  const handleChangeSingleEliminationBracket = useCallback(
    (data: Bracket[]) => {
      if (!hasPermissions) {
        return;
      }

      singleEliminationBracketMutation.mutate({
        id: id as string,
        structure: data,
      });
    },
    [hasPermissions, id, singleEliminationBracketMutation],
  );

  const nextStatusMutation =
      api.match.nextStatus.useMutation();

  const startMatch = useCallback(() => {
    nextStatusMutation.mutate({
      id: id as string,
    })

    void matchGetQuery.refetch();
  }, [id, nextStatusMutation]);

  const endMatch = useCallback(() => {
    nextStatusMutation.mutate({
      id: id as string,
    })

    void matchGetQuery.refetch();

  }, [id, nextStatusMutation]);

  if (matchGetQuery.data == null) {
    return <Loader type="fluid" />;
  }

  return (
    <>
      <Modal isOpen={showEditModal} onClose={handleCloseEditModal}>
        <UIH3>Предупреждение</UIH3>
        <br />
        <UIP>Сохранить изменения?</UIP>
        <br />
        <br />
        <br />
        <UIButton onClick={handleSaveChanges}>Да</UIButton>
        <br />
        <br />
        <UIButton onClick={handleDiscardChanges}>Нет</UIButton>
      </Modal>
      <UIH2>Информация </UIH2>
      <UIH3>Описание</UIH3>
      <Section>
        <UIP>
          Матч &#34;<UIBold>{matchGetQuery.data.name}</UIBold>&#34;
          организованный &#34;
          <UIBold>{matchGetQuery.data.organization.name}</UIBold>&#34; будет
          проходить {formatEventDate(matchGetQuery.data.startAt)}
        </UIP>
      </Section>
      <UIH3>
        Подробности
        {hasPermissions && (
          <IconButton
            icon={editMode ? IconEnum.SETTINGS_FILL : IconEnum.SETTINGS}
            size={20}
            onClick={handleSwitchEditMode}
            disabled={false}
          />
        )}
      </UIH3>
      <Section>
        <InfoList>
          <InfoItem>
            <InfoItemName>Организация:</InfoItemName>
            <InfoItemValue>
              &#34;{matchGetQuery.data.organization.name}&#34;
            </InfoItemValue>
          </InfoItem>
          <InfoItem>
            <InfoItemName>Матч:</InfoItemName>
            {editMode ? (
              <InfoItemValueInput
                value={editedMathName}
                onChange={(e) => setEditedMathName(e.target.value)}
              />
            ) : (
              <InfoItemValue>&#34;{matchGetQuery.data.name}&#34;</InfoItemValue>
            )}
          </InfoItem>
          <InfoItem>
            <InfoItemName>Максимальное количество участников:</InfoItemName>
            {editMode ? (
              <InfoItemValueInput
                value={editedMaxParticipant}
                onChange={(e) =>
                  setEditedMaxParticipant(parseInt(e.target.value))
                }
              />
            ) : (
              <InfoItemValue>
                &#34;{matchGetQuery.data.participantsCount}&#34;
              </InfoItemValue>
            )}
          </InfoItem>
          <InfoItem>
            <InfoItemName>Категория:</InfoItemName>
            {editMode ? (
              <InfoItemValueInput
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
              />
            ) : (
              <InfoItemValue>
                &#34;{matchGetQuery.data.category}&#34;
              </InfoItemValue>
            )}
          </InfoItem>
          <InfoItem>
            <InfoItemName>Гендер:</InfoItemName>
            {editMode ? (
              <InfoItemValueInput
                value={editedGender}
                onChange={(e) => setEditedGender(e.target.value)}
              />
            ) : (
              <InfoItemValue>
                &#34;{matchGetQuery.data.gender}&#34;
              </InfoItemValue>
            )}
          </InfoItem>
        </InfoList>
      </Section>
      <UIH3>Турнирная сетка</UIH3>
      {meOrganizationMemberQuery.data?.organizationId ===
        matchGetQuery.data.organizationId &&
      meOrganizationMemberQuery.data.role !== MemberRole.MEMBER &&
      matchGetQuery.data.status === MatchStatus.SCHEDULED ? (
        <UIButton onClick={startMatch}>Начать матч</UIButton>
      ) : matchGetQuery.data.status === MatchStatus.STARTED ? (
        <UIButton onClick={endMatch}>Завершить матч</UIButton>
      ) : null}
      {matchGetQuery.data.status === MatchStatus.SCHEDULED ? (
        <UIP>Сетка еще не создана</UIP>
      ) : (
        <SingleEliminationBracket
          matches={JSON.parse(matchGetQuery.data.structure) as Bracket[]}
          participantsCount={matchGetQuery.data.participantsCount}
          onChange={handleChangeSingleEliminationBracket}
        />
      )}
    </>
  );
};

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  width: 100%;

  user-select: none;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  gap: 8px;

  border-radius: 8px;

  padding: 8px 16px;

  &:hover {
    background: rgba(159, 159, 159, 0.1);
  }
`;

const InfoItemName = styled(UIBold)`
  padding: 8px 0;
`;

const InfoItemValue = styled(UIP)`
  padding: 8px 0;
`;

const InfoItemValueInput = styled.input`
  background: unset;
  outline: none;
  border: none;

  color: #e6e6e6;
  font-size: 18px;
  font-weight: normal;

  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;

  padding: 8px;
`;

const ParticipantsContent: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const matchGetQuery = api.match.getMatch.useQuery({
    id: id as string,
  });

  const refresh = useCallback(() => {
    void matchGetQuery.refetch();
  }, [matchGetQuery]);

  if (matchGetQuery.data == null) {
    return <Loader type="fluid" />;
  }

  return (
    <>
      <UIH2>
        Участники ({matchGetQuery.data.participants.length} /{" "}
        {matchGetQuery.data.participantsCount})
        <IconButton icon={IconEnum.REFRESH} onClick={refresh} />
      </UIH2>
      <ParticipantList>
        {matchGetQuery.isRefetching ? (
          <Loader type="fluid" />
        ) : matchGetQuery.data.participants.length < 1 ? (
          <UIP>Участников пока нет</UIP>
        ) : (
          matchGetQuery.data.participants.map((participant) => (
            <ParticipantListItem key={participant.id}>
              <ParticipantListItemValue>
                @{participant.login}
              </ParticipantListItemValue>
            </ParticipantListItem>
          ))
        )}
      </ParticipantList>
    </>
  );
};

const ParticipantList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ParticipantListItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  gap: 32px;
  border-radius: 8px;
  background: #111115;
  width: 100%;
  padding: 16px 24px;
`;

const ParticipantListItemValue = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: white;
`;

const InvitesContent: React.FC = () => {
  const { addNotification } = useNotifications();

  const router = useRouter();
  const { id } = router.query;

  const matchGetQuery = api.match.getMatch.useQuery({
    id: id as string,
  });
  const matchInviteMutation = api.match.invite.useMutation();

  useEffect(() => {
    if (matchInviteMutation.isError) {
      addNotification("Произошла ошибка", NotificationTypeEnum.ERROR);
    }
  }, [matchInviteMutation.isError]);

  useEffect(() => {
    if (matchInviteMutation.isSuccess) {
      addNotification("Запрос успешно отправлен", NotificationTypeEnum.SUCCESS);
      void matchGetQuery.refetch();
      setUserLogin("");
      setShowInviteModal(false);
    }
  }, [matchInviteMutation.isSuccess]);

  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);

  const handleOpenEditModal = useCallback(() => {
    setShowInviteModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowInviteModal(false);
  }, []);

  const [userLogin, setUserLogin] = useState<string>("");

  const handleOrganizationDescriptionChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      setUserLogin(event.target.value);
    }, []);

  const handleSendInvite = useCallback(async () => {
    matchInviteMutation.mutate({
      matchId: id as string,
      login: userLogin,
    });
  }, [id, matchGetQuery, matchInviteMutation, userLogin]);

  const refresh = useCallback(() => {
    void matchGetQuery.refetch();
  }, [matchGetQuery]);

  if (matchGetQuery.data == null) {
    return <Loader type="fluid" />;
  }

  return (
    <>
      <Modal isOpen={showInviteModal} onClose={handleCloseEditModal}>
        <ModalContent>
          <UIH3>Отправка приглашения</UIH3>
          <UIInput
            header="Пользователь"
            type="text"
            value={userLogin}
            onChange={handleOrganizationDescriptionChange}
          />
          <UIButton onClick={handleSendInvite}>Отправить</UIButton>
        </ModalContent>
      </Modal>
      <UIH2>
        Количество приглашений ({matchGetQuery.data.invites.length} /{" "}
        {matchGetQuery.data.participantsCount -
          matchGetQuery.data.participants.length}
        ) <IconButton icon={IconEnum.PLUS} onClick={handleOpenEditModal} />
        <IconButton icon={IconEnum.REFRESH} onClick={refresh} />
      </UIH2>
      <InviteList>
        {matchGetQuery.isRefetching ? (
          <Loader type="fluid" />
        ) : matchGetQuery.data.invites.length < 1 ? (
          <UIP>Приглашений пока нет</UIP>
        ) : (
          matchGetQuery.data.invites.map((invite) => (
            <InviteListItem key={invite.id}>
              <InviteListItemValue>@{invite.user.login}</InviteListItemValue>
            </InviteListItem>
          ))
        )}
      </InviteList>
    </>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;

  gap: 24px;
`;

const InviteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InviteListItem = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 32px;
  border-radius: 8px;
  background: #111115;
  width: 100%;
  padding: 16px 24px;
`;

const InviteListItemValue = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: white;
`;
