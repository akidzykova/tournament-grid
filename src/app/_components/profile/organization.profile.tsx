"use client";

import React, {
  type ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import styled, {css} from "styled-components";
import { UIButton } from "../UI/button.component";
import { UIInput } from "../UI/input.component";
import { api } from "~/trpc/react";
import { UserContext } from "~/contexts/user.context";
import { useRouter } from "next/router";
import { Modal } from "~/app/_components/modal.component";
import { UIH3 } from "~/app/_components/UI/h3.component";
import { UIH2 } from "~/app/_components/UI/h2.component";
import { UIH1 } from "~/app/_components/UI/h1.component";
import { UIP } from "~/app/_components/UI/p.component";
import { UISelect } from "~/app/_components/UI/select.component";
import { UIDataPicker } from "~/app/_components/UI/data.picker.component";
import { useNotifications } from "~/app/notification/use-notifications.hook";
import { NotificationTypeEnum } from "~/app/notification/types";
import { Loader } from "~/app/_components/loader.component";
import { IconButton } from "~/app/_components/UI/icon-button.component";
import { IconEnum } from "~/app/_components/UI/icon.component";
import {formatJoinedDate} from "~/utils/date";

export const OrganizationProfile: React.FC = () => {
  const userContext = useContext(UserContext);

  const organizationQuery = api.organization.getMeOrganization.useQuery();
  const organizationRequestQuery = api.organization.getRequest.useQuery();

  const isLoading = useMemo(() => {
    return organizationQuery.isLoading || organizationRequestQuery.isLoading;
  }, [organizationQuery, organizationRequestQuery]);

  const { header, OrganizationContent } = useMemo(() => {
    if (userContext.userData === null) {
      return {
        header: "",
        OrganizationContent: null,
      };
    }

    if (organizationQuery.data != null) {
      return {
        header: `Организация ${organizationQuery.data.name}`,
        OrganizationContent: (
          <OrganizationInfo key={organizationQuery.data.id} />
        ),
      };
    }

    if (organizationRequestQuery.data != null) {
      return {
        header: `Организация ${organizationRequestQuery.data.name}`,
        OrganizationContent: (
          <OrganizationRequest
            key={organizationRequestQuery.data.requestedAt.getDate().toString()}
          />
        ),
      };
    }

    return {
      header: "Организация",
      OrganizationContent: <NoOrganization />,
    };
  }, [
    organizationQuery.data,
    organizationRequestQuery.data,
    userContext.userData,
  ]);

  return (
    <>
      <Wrapper>
        <UIH1>{header}</UIH1>
        <hr />
        {isLoading ? <Loader type={"fluid"} /> : OrganizationContent}
      </Wrapper>
    </>
  );
};

//#region no organization
const NoOrganization: React.FC = () => {
  const { addNotification } = useNotifications();

  const organizationRequest = api.organization.getRequest.useQuery();

  const userContext = useContext(UserContext);
  const createRequestMutation = api.organization.createRequest.useMutation();

  const [showModel, setShowModal] = useState<boolean>(false);
  const [organizationName, setOrganizationName] = useState<string>("");
  const [organizationDescription, setOrganizationDescription] =
    useState<string>("");

  const handleShowModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleHideModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleOrganizationNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setOrganizationName(event.currentTarget.value);
    },
    [],
  );

  const handleOrganizationDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setOrganizationDescription(event.currentTarget.value);
    },
    [],
  );

  const handleCreateOrganizationRequest = useCallback(() => {
    createRequestMutation.mutate(
      {
        name: organizationName,
        description: organizationDescription,
      },
      {
        onSuccess: (data) => {
          setShowModal(false);

          addNotification(
            "Заявка успешно создана!",
            NotificationTypeEnum.SUCCESS,
          );

          void organizationRequest.refetch();
        },
        onError: (error) => {
          addNotification("Произошла ошибка!", NotificationTypeEnum.ERROR);
        },
      },
    );
  }, [createRequestMutation, organizationName, userContext]);

  return (
    <>
      <UIH2>У вас нет доступа к этому разделу.</UIH2>
      <UIP>
        Вы можете подать заявку на создание собственной организации. Заявка
        будет рассмотрена администрацией в течение 24 часов.
      </UIP>
      <br />
      <UIButton onClick={handleShowModal}>Подать заявку</UIButton>
      <Modal isOpen={showModel} onClose={handleHideModal}>
        <ModalContent>
          <UIH3>Запрос на создание организации</UIH3>
          <UIInput
            header="Название организации"
            type="text"
            value={organizationName}
            onChange={handleOrganizationNameChange}
          />
          <UIInput
            header="Описание организации"
            type="text"
            value={organizationDescription}
            onChange={handleOrganizationDescriptionChange}
          />
          <UIButton onClick={handleCreateOrganizationRequest}>
            Отправить
          </UIButton>
        </ModalContent>
      </Modal>
    </>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;

  gap: 24px;
`;
//#endregion

//#region organization request exist
const OrganizationRequest: React.FC = () => {
  return (
    <>
      <UIH2>Ваша заявка принята на рассмотрение.</UIH2>
      <UIP>Заявка будет рассмотрена администрацией в течение 24 часов.</UIP>
    </>
  );
};
//#endregion

//#region organization
enum Tab {
  INFORMATION,
  MATCHES,
  MEMBERS,
}

const OrganizationInfo: React.FC = () => {
  const { addNotification } = useNotifications();

  const organizationMeQuery = api.organization.getMeOrganization.useQuery();
  const matchCreateMutation = api.match.create.useMutation();

  useEffect(() => {
    if (matchCreateMutation.isError) {
      addNotification("Произошла ошибка", NotificationTypeEnum.ERROR);
    }
  }, [matchCreateMutation.isError]);

  useEffect(() => {
    if (matchCreateMutation.isSuccess) {
      addNotification("Матч успешно создан", NotificationTypeEnum.SUCCESS);
      void organizationMeQuery.refetch();
    }
  }, [matchCreateMutation.isSuccess]);

  const [tab, setTab] = useState<Tab>(Tab.INFORMATION);
  const content = useMemo(() => {
    switch (tab) {
      case Tab.INFORMATION: {
        return <InformationContent />;
      }
      case Tab.MATCHES: {
        return <MatchesContent />;
      }
      case Tab.MEMBERS: {
        return <MembersContent />;
      }
    }
  }, [tab]);

  if (organizationMeQuery.data == null) {
    return <Loader />;
  }

  return <>
    <Section>
      <NavButton
          active={tab === Tab.INFORMATION}
          onClick={() => setTab(Tab.INFORMATION)}
      >
        Информация
      </NavButton>
      <NavButton
          active={tab === Tab.MATCHES}
          onClick={() => setTab(Tab.MATCHES)}
      >
        Матчи
      </NavButton>
      <NavButton
          active={tab === Tab.MEMBERS}
          onClick={() => setTab(Tab.MEMBERS)}
      >
        Участники
      </NavButton>
    </Section>
    {content}
  </>;
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 24px;

  padding: 0 56px;
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
  const organizationGetQuery = api.organization.getMeOrganization.useQuery();

  if (organizationGetQuery.data == null) {
    return null;
  }

  return (
      <>
        <UIH2>Информация</UIH2>
        <UIH3>Описание</UIH3>
        <Section>
          <UIP>{organizationGetQuery.data.description}</UIP>
        </Section>
      </>
  );
};

const MatchesContent: React.FC = () => {
  const { addNotification } = useNotifications();

  const organizationMeQuery = api.organization.getMeOrganization.useQuery();

  const matchCreateMutation = api.match.create.useMutation();

  const [gender, setGender] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [participantsCount, setParticipantsCount] = useState<number>(0);

  const handleGenderInputChange = useCallback((value: string) => {
    setGender(value);
  }, []);

  const handleCategoryInputChange = useCallback((value: string) => {
    setCategory(value);
  }, []);

  const handleDateInputChange = useCallback((value: string) => {
    setDate(value);
  }, []);

  const handleNameInputChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.currentTarget.value);
      },
      [],
  );

  const handleParticipantsCountInputChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        setParticipantsCount(Number(event.currentTarget.value));
      },
      [],
  );

  const handleCreateMatch = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if ((participantsCount & (participantsCount - 1)) !== 0) {
          addNotification(
              "Количество участников должно быть степень двойки",
              NotificationTypeEnum.ERROR,
          );
          return;
        }

        matchCreateMutation.mutate({
          gender: gender,
          category: category,
          date: date,
          name: name,
          participantsCount: participantsCount,
        });
      },
      [participantsCount, matchCreateMutation, gender, category, date, name],
  );


  if (organizationMeQuery.data == null) {
    return null;
  }

  return (
      <>
        <UIH2>Создать матч</UIH2>
        <hr />
        <CreateMatchWrapper>
          <CreateMatchWrapperSection>
            <UISelect
                options={["Все", "Мужчины", "Женщины", "Дети"]}
                onChange={handleGenderInputChange}
            />
            <UISelect
                options={[
                  "Все",
                  "Международный",
                  "Национальный",
                  "Тур ТТА",
                  "Штат открывается",
                  "Разнообразие и равенство",
                ]}
                onChange={handleCategoryInputChange}
            />
            <UIDataPicker
                placeholder="Дата начала турнира"
                onSelect={
                  handleDateInputChange as (date: string | undefined) => void
                }
            ></UIDataPicker>
          </CreateMatchWrapperSection>
          <CreateMatchWrapperSection>
            <UIInput
                value={name}
                placeholder="Название"
                type="text"
                onChange={handleNameInputChange}
            />
            <UIInput
                placeholder="Количество участников"
                type="number"
                onChange={handleParticipantsCountInputChange}
            />
            <UIButton onClick={handleCreateMatch}>Создать</UIButton>
          </CreateMatchWrapperSection>
        </CreateMatchWrapper>
        <UIH2>Матчи</UIH2>
        <MatchList>
          {organizationMeQuery.data.matches.length < 1 ? (
              <UIP>Матчей пока нет</UIP>
          ) : (
              organizationMeQuery.data.matches.map((match) => (
                  <MatchListItem key={match.id}>
                    <MatchListItemValue>{match.name}</MatchListItemValue>
                    <MatchListItemValue>{match.gender}</MatchListItemValue>
                    <MatchListItemValue>{match.category}</MatchListItemValue>
                    <MatchListItemValue>{match.participantsCount}</MatchListItemValue>
                    <MatchListItemValue>{match.date}</MatchListItemValue>
                  </MatchListItem>
              ))
          )}
        </MatchList>
      </>
  );
};


const CreateMatchWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
`;

const CreateMatchWrapperSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 8px;
`;

const MatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MatchListItem = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 32px;
  border-radius: 8px;
  background: #111115;
  width: 100%;
  padding: 16px 24px;
`;

const MatchListItemValue = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: white;
`;

const MembersContent: React.FC = () => {
  const organizationGetQuery = api.organization.getMeOrganization.useQuery();

  const [showInviteModal, setShowInviteModal] = useState(false);

  const [userLogin, setUserLogin] = useState<string>('');

  const handleOpenInviteModal = useCallback(() => {
    setShowInviteModal(true)
  }, [])

  const handleCloseEditModal = useCallback(() => {
    setShowInviteModal(false);
    setUserLogin('');
  }, [])

  const handleLoginChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    setUserLogin(event.currentTarget.value);
  }, [])

  const sendOrganizationInviteMutation = api.organization.sendOrganizationInvite.useMutation();

  const handleSendInvite = useCallback(() => {
    sendOrganizationInviteMutation.mutate({
      userLogin: userLogin,
    })
  }, [userLogin])

  if (organizationGetQuery.data == null) {
    return null;
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
                onChange={handleLoginChange}
            />
            <UIButton onClick={handleSendInvite}>Отправить</UIButton>
          </ModalContent>
        </Modal>
        <UIH2>Участники
          <IconButton icon={IconEnum.PLUS} onClick={handleOpenInviteModal}/>
        </UIH2>
        <MemberList>
          {organizationGetQuery.data.members.map((member) => (
              <MemberListItem key={member.id}>
                <MemberListItemName>@{member.user.login}</MemberListItemName>
                <MemberListItemRole>{member.role}</MemberListItemRole>
                <MemberListItemJoinAt>
                  <span>Вступил: </span>
                  <MemberListItemJoinAtTime>
                    {formatJoinedDate(member.joinedAt)}
                  </MemberListItemJoinAtTime>
                </MemberListItemJoinAt>
              </MemberListItem>
          ))}
        </MemberList>
      </>
  );
};

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
`;

const MemberListItem = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  border-radius: 8px;
  background: #111115;
  width: 100%;
  padding: 16px 24px;
`;

const MemberListItemName = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: white;
`;

const MemberListItemRole = styled.div`
  font-weight: normal;
  font-size: 16px;
  color: white;
`;

const MemberListItemJoinAt = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;

  font-weight: normal;
  font-size: 14px;
  color: white;
`;

const MemberListItemJoinAtTime = styled.span`
  font-weight: lighter;
  font-size: 14px;
  color: #e4e4e4;
`;
