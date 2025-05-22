import type { AppProps } from "next/app";
import { GlobalStyle } from "~/styles/globals";
import { TRPCReactProvider } from "~/trpc/react";
import { Montserrat } from "next/font/google";
import { HeaderComponent } from "~/app/_components/header/header.component";
import { UserContext, type UserContextData } from "~/contexts/user.context";
import {useCallback, useEffect, useState} from "react";
import { AuthLayout } from "~/app/_components/auth.layout.component";
import { NotificationProvider } from "~/app/notification/notification-context.provider";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export default function MyApp({ Component, pageProps }: AppProps) {
  const [token, setToken] = useState<UserContextData['token']>(null)
  const [userData, setUserData] = useState<UserContextData['userData']>(undefined);

  useEffect(() => {
    const token = localStorage.getItem('JWT_TOKEN');
    setToken(token);
  }, []);

  useEffect(() => {
    if (token == null) {
      localStorage.removeItem('JWT_TOKEN');

      return;
    }

    localStorage.setItem('JWT_TOKEN', token);
  }, [token]);

  const userContext: UserContextData = {
    token: token,
    userData: userData,
    setToken: setToken,
    setUserData: setUserData
  }

  return (
    <div id='root' className={montserrat.className}>
      <GlobalStyle />
      <TRPCReactProvider token={token}>
        <NotificationProvider>
          <UserContext.Provider value={userContext}>
            <AuthLayout>
              <HeaderComponent />
              <Component {...pageProps} />
            </AuthLayout>
          </UserContext.Provider>
        </NotificationProvider>
      </TRPCReactProvider>
    </div>
  );
}