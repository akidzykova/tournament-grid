import React, { useContext, useEffect } from "react";
import { UserContext } from "~/contexts/user.context";
import { api } from "~/trpc/react";

export const AuthLayout: React.FC<React.PropsWithChildren> = (props) => {
    const userContext = useContext(UserContext)
    const userGetMutation = api.user.get.useQuery()

    useEffect(() => {
        if (userGetMutation.data == null) {
            userContext.setUserData(undefined);
            return;
        }

        userContext.setUserData(userGetMutation.data);
    }, [userContext.setUserData, userGetMutation.data]);

    useEffect(() => {
        void userGetMutation.refetch();
    }, [userContext.token]);

    return props.children;
}