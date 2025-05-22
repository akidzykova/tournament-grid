"use client";

import React, {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { Loader } from "~/app/_components/loader.component";
import { UIButton } from "~/app/_components/UI/button.component";
import { UIForm } from "~/app/_components/UI/form.component";
import { UIH3 } from "~/app/_components/UI/h3.component";
import { UIInput } from "~/app/_components/UI/input.component";
import { UIP } from "~/app/_components/UI/p.component";
import {
  AuthorizationFormContext,
  type AuthorizationFormContextData,
} from "~/contexts/authorization.form.context.";
import { UserContext } from "~/contexts/user.context";
import { api } from "~/trpc/react";
import { useNotifications } from "~/app/notification/use-notifications.hook";
import { NotificationTypeEnum } from "~/app/notification/types";

export default function Authentication() {
  const route = useRouter();
  const userContext = useContext(UserContext);

  useEffect(() => {
    if (userContext.userData == null) {
      return;
    }

    void route.push("/profile");
  }, [route, userContext.userData]);

  const [isAuthenticationFormState, setAuthenticationFormState] =
    useState(true);

  const authorizationFormContext: AuthorizationFormContextData = {
    isAuthenticationFormState: isAuthenticationFormState,
    setAuthenticationFormState: setAuthenticationFormState,
  };

  return (
    <AuthorizationFormContext.Provider value={authorizationFormContext}>
      <BackgroundImage src="background.png" />
      {isAuthenticationFormState ? <AuthorizationForm /> : <RegistrationForm />}
    </AuthorizationFormContext.Provider>
  );
}

const AuthorizationForm: React.FC = () => {
  const { addNotification } = useNotifications();

  const authorizationContext = useContext(AuthorizationFormContext);
  const userContext = useContext(UserContext);

  const userLoginMutation = api.user.login.useMutation();

  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChangeForm = useCallback(() => {
    authorizationContext.setAuthenticationFormState(false);
  }, [authorizationContext]);

  const handleEmailInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setEmail(event.currentTarget.value);
      setEmailError(null);
    },
    [],
  );

  const handlePasswordInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPassword(event.currentTarget.value);
      setPasswordError(null);
    },
    [],
  );

  const handleContinue = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      userLoginMutation.mutate(
        {
          email: email,
          password: password,
        },
        {
          onSuccess: (data) => {
            userContext.setToken(data.token);

            addNotification(
              "Вход выполнен успешно!",
              NotificationTypeEnum.SUCCESS,
            );
          },
          onError: (error) => {
            if (error.message === "user not found") {
              setEmailError("Пользователь не зарегистрирован!");

              addNotification(
                "Пользователь не зарегистрирован!",
                NotificationTypeEnum.ERROR,
              );

              return;
            }

            if (error.message === "passwords not matched") {
              setPasswordError("Пароль указан неверно!");

              addNotification(
                "Пароль указан неверно!",
                NotificationTypeEnum.ERROR,
              );

              return;
            }
          },
        },
      );
    },
    [email, password, userContext, userLoginMutation, addNotification],
  );

  return (
    <View>
      <UIForm onSubmit={handleContinue} spellCheck={"false"}>
        <FormTitle>
          <UIH3>С возвращением!</UIH3>
          <UIP>Мы рады видеть вас снова!</UIP>
        </FormTitle>
        <Group>
          <UIInput
            header={"электронная почта"}
            value={email}
            type="email"
            onChange={handleEmailInputChange}
            errorText={emailError}
          />
          <ElementLayout>
            <UIInput
              header={"пароль"}
              type={"password"}
              value={password}
              autoComplete="off"
              onChange={handlePasswordInputChange}
              errorText={passwordError}
            />
            <LayoutText>
              <a>Забыли пароль?</a>
            </LayoutText>
          </ElementLayout>
        </Group>
        <ElementLayout>
          <UIButton disabled={!!emailError || !!passwordError}>Вход</UIButton>
          <LayoutText>
            <p>Нужна учётная запись?</p>
            <a onClick={handleChangeForm}> Зарегистрироваться</a>
          </LayoutText>
        </ElementLayout>
      </UIForm>
    </View>
  );
};

const RegistrationForm = () => {
  const { addNotification } = useNotifications();
  const userContext = useContext(UserContext);
  const authorizationContext = useContext(AuthorizationFormContext);

  const userCreateMutation = api.user.create.useMutation();

  const [login, setLogin] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [retryPassword, setRetryPassword] = useState<string>("");

  const handleChangeForm = useCallback(() => {
    authorizationContext.setAuthenticationFormState(true);
  }, [authorizationContext.setAuthenticationFormState]);

  const handleLoginInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setLogin(event.currentTarget.value);
    },
    [],
  );

  const handleEmailInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setEmail(event.currentTarget.value);
    },
    [],
  );

  const handlePasswordInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPassword(event.currentTarget.value);
    },
    [],
  );

  const handleRetryPasswordInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setRetryPassword(event.currentTarget.value);
    },
    [],
  );

  const handleContinue = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (password !== retryPassword) {
        addNotification(
            `Пароли не совпадают!`,
            NotificationTypeEnum.ERROR,
        );

        return;
      }

      userCreateMutation.mutate(
        {
          email: email,
          login: login,
          password: password,
        },
        {
          onSuccess: (data) => {
            userContext.setToken(data.token);

            addNotification(
              "Пользователь успешно зарегистрирован!",
              NotificationTypeEnum.SUCCESS,
            );
          },
          onError: (error) => {
            addNotification(
                `Ошибка регистрации: ${error.message}`,
                NotificationTypeEnum.ERROR,
            );
          },
        },
      );
    },
    [password, retryPassword, userCreateMutation, email, login, authorizationContext, addNotification],
  );

  return (
    <View>
      <UIForm onSubmit={handleContinue} spellCheck={"false"}>
        <FormTitle>
          <UIH3>Добро пожаловать!</UIH3>
          <UIP>Время для смелых шагов!</UIP>
        </FormTitle>
        <Group>
          <UIInput
            header={"Логин"}
            value={login}
            type="login"
            onChange={handleLoginInputChange}
          />
          <UIInput
            header={"электронная почта"}
            value={email}
            type="email"
            onChange={handleEmailInputChange}
          />
          <ElementLayout>
            <UIInput
              header={"пароль"}
              type={"password"}
              value={password}
              onChange={handlePasswordInputChange}
            />
            <LayoutText>
              <p>
                Пароль должен содержать не менее восьми
                <br />
                знаков, включать буквы, цифры и<br />
                специальные символы.
              </p>
            </LayoutText>
          </ElementLayout>
          <ElementLayout>
            <UIInput
              header={"повторите пароль"}
              type={"password"}
              value={retryPassword}
              onChange={handleRetryPasswordInputChange}
            />
            <LayoutText>
              <p>Повторите введённый пароль.</p>
            </LayoutText>
          </ElementLayout>
        </Group>
        <ElementLayout>
          <UIButton>Продолжить</UIButton>
          <LayoutText>
            <a onClick={handleChangeForm}>Уже зарегистрированы?</a>
          </LayoutText>
        </ElementLayout>
      </UIForm>
    </View>
  );
};

const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  z-index: -1;
  opacity: 18%;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  pointer-events: none;
`;

const View = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 48px 24px;
  background-color: #0c0c0f;
`;

const FormTitle = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
  width: 100%;

  p {
    color: #a6a6a6;
    font-weight: 400;
  }
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 24px;
  width: 100%;
`;

const LayoutText = styled.div`
  display: flex;
  font-size: 14px;
  font-weight: 600;
  white-space: pre;

  & a {
    color: #ff6600;
    cursor: pointer;
  }

  & p {
    color: #a6a6a6;
    font-weight: 400;
  }
`;

const ElementLayout = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
  width: 100%;
`;