"use client";

import { useRouter } from "next/router";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import styled from "styled-components";
import { Loader } from "~/app/_components/loader.component";
import { OrganizationProfile } from "~/app/_components/profile/organization.profile";
import { UserProfile } from "~/app/_components/profile/user.profile";
import { UIButton } from "~/app/_components/UI/button.component";
import {
  ProfileContext,
  type ProfileContextData,
} from "~/contexts/profile.context";
import { UserContext } from "~/contexts/user.context";
import { useNotifications } from "~/app/notification/use-notifications.hook";
import { NotificationTypeEnum } from "~/app/notification/types";
import { UIH3 } from "~/app/_components/UI/h3.component";
import { Modal } from "~/app/_components/modal.component";
import { UIP } from "~/app/_components/UI/p.component";
import { NotificationsProfile } from "~/app/_components/profile/notifications.profile";
import {InvitesProfile} from "~/app/_components/profile/invites.profile";
import {AdminProfile} from "~/app/_components/profile/admin.profile";

enum ProfileRouteEnum {
  INDEX,
  NOTIFICATIONS,
  INVITES,
  ORGANIZATION,
  ADMIN_DASHBOARD,
}

export default function Profile() {
  const { addNotification } = useNotifications();

  const [isLoading, setLoadingScreen] = useState<boolean>(true);
  const userContext = useContext(UserContext);
  const route = useRouter();

  useEffect(() => {
    if (userContext.userData == null) {
      void route.push("/");

      return;
    }

    setLoadingScreen(false);
  }, [route, userContext.userData]);

  const [selectedContent, selectContent] = useState<ProfileRouteEnum>(
    ProfileRouteEnum.INDEX,
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("JWT_TOKEN");
    userContext.setUserData(undefined);

    addNotification("Вы вышли из аккаунта", NotificationTypeEnum.INFO);
  }, [addNotification, userContext]);

  const handleSelectContent = useCallback((selectedName: ProfileRouteEnum) => {
    selectContent(selectedName);
  }, []);

  const profileContext: ProfileContextData = {
    userData: userContext.userData,
  };

  const isAdmin = profileContext.userData?.roles.includes("admin");

  const { ProfileContent } = useMemo(() => {
    switch (selectedContent) {
      case ProfileRouteEnum.INDEX: {
        return {
          ProfileContent: <UserProfile />,
        };
      }
      case ProfileRouteEnum.NOTIFICATIONS: {
        return {
          ProfileContent: <NotificationsProfile />,
        };
      }
      case ProfileRouteEnum.INVITES: {
        return {
          ProfileContent: <InvitesProfile />,
        };
      }
      case ProfileRouteEnum.ORGANIZATION: {
        return {
          ProfileContent: <OrganizationProfile />,
        };
      }
      case ProfileRouteEnum.ADMIN_DASHBOARD: {
        return {
          ProfileContent: <AdminProfile />,
        };
      }
    }

    return {
      ProfileContent: null,
    };
  }, [selectedContent]);

  const [showModel, setShowModal] = useState<boolean>(false);

  const handleShowModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleHideModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <ProfileContext.Provider value={profileContext}>
          <Wrapper>
            <Menu>
              <UIButton
                onClick={() => handleSelectContent(ProfileRouteEnum.INDEX)}
                style={
                  selectedContent == ProfileRouteEnum.INDEX
                    ? { backgroundColor: "#FF6600" }
                    : {}
                }
              >
                Профиль
              </UIButton>
              <UIButton
                onClick={() =>
                  handleSelectContent(ProfileRouteEnum.NOTIFICATIONS)
                }
                style={
                  selectedContent == ProfileRouteEnum.NOTIFICATIONS
                    ? { backgroundColor: "#FF6600" }
                    : {}
                }
              >
                Уведомления
              </UIButton>
              <UIButton
                  onClick={() =>
                      handleSelectContent(ProfileRouteEnum.INVITES)
                  }
                  style={
                    selectedContent == ProfileRouteEnum.INVITES
                        ? { backgroundColor: "#FF6600" }
                        : {}
                  }
              >
                Приглашения
              </UIButton>
              <UIButton
                onClick={() =>
                  handleSelectContent(ProfileRouteEnum.ORGANIZATION)
                }
                style={
                  selectedContent == ProfileRouteEnum.ORGANIZATION
                    ? { backgroundColor: "#FF6600" }
                    : {}
                }
              >
                Организация
              </UIButton>
              {isAdmin ? (
                <UIButton
                  onClick={() =>
                    handleSelectContent(ProfileRouteEnum.ADMIN_DASHBOARD)
                  }
                  style={
                    selectedContent == ProfileRouteEnum.ADMIN_DASHBOARD
                      ? { backgroundColor: "#FF6600" }
                      : {}
                  }
                >
                  Админ панель
                </UIButton>
              ) : null}
              <UIButton onClick={handleShowModal}>Выйти</UIButton>
            </Menu>
            <Content>{ProfileContent}</Content>
          </Wrapper>
          <Modal isOpen={showModel} onClose={handleHideModal}>
            <ModalContent>
              <UIH3>Выход из аккаунта</UIH3>
              <UIP>Вы действительно уверены, что хотите выйти из аккаунта?</UIP>
              <UIButton onClick={handleLogout}>Выйти</UIButton>
              <UIButton onClick={handleHideModal}>Отмена</UIButton>
            </ModalContent>
          </Modal>
        </ProfileContext.Provider>
      )}
    </>
  );
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0 48px;

  display: flex;
`;

const Content = styled.div`
  padding: 0 0 0 24px;
  width: 100%;
`;

const Menu = styled.div`
  position: relative;
  height: 100%;
  width: 340px;
  display: flex;
  flex-direction: column;
  row-gap: 8px;
  border-right: 1px solid #1a1a20;
  padding: 0 24px 0 0;

  button {
    background-color: #111115;
    text-align: left;
  }

  button:hover {
    background-color: #1a1a20;
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;

  gap: 24px;
`;
