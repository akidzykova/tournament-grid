"use client";

import { forwardRef, useContext } from "react";
import styled from "styled-components";
import { ProfileContext } from "~/contexts/profile.context";
import { UserContext } from "~/contexts/user.context";

const RoleMapper = new Map([
    ['user', 'Пользователь'],
    ['organizer', 'Организатор'],
    ['admin','Администратор']
])

interface UserProfileProps extends React.HTMLAttributes<HTMLDivElement> {
}
  
export const UserProfile = forwardRef<HTMLDivElement, UserProfileProps>(
    (props, ref) => {
        const profileContext = useContext(ProfileContext)

        return <Wrapper ref={ref} {...props}>
            <Profile>
                <Avatar>
                    <img src='racket.svg' />
                </Avatar>
                <ProfileTitle>
                    <h1>@{profileContext.userData?.login}</h1>
                    <Tags>
                        {
                            profileContext.userData?.roles.map((role) => (<Tag>{RoleMapper.get(role)}</Tag>))
                        }
                    </Tags>
                </ProfileTitle>
            </Profile>
            <hr/>
            <MatchesHistory>
                <h1>История матчей</h1>
                <h3>Вы ещё не принимали участия в матчах 😥</h3>
            </MatchesHistory>
        </Wrapper>;
    }
);

UserProfile.displayName = "UserProfile"

const Wrapper = styled.div`
    /* background-color: #111115; */
    display: flex;
    flex-direction: column;
    row-gap: 48px;
    padding: 24px;
    color: white;

    hr {
        border: 0;
        border-top: 1px solid #1c1c23;
    }

    h3 {
        color: #A6A6A6;
        font-weight: 600;
    }
`

const Profile = styled.div`
    display: flex;
    column-gap: 24px;
`

const MatchesHistory = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 24px;
`

const Avatar = styled.div`
    width: 100px;
    height: 100px;
    border-radius: 100%;

    color: black;
    text-align: center;
    align-content: center;

    background-color: #1c1c23;

    img {
        margin-top: 6px;
        width: 50px;
    }
`

const ProfileTitle = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    color: white;
    padding: 8px 0;
`

const Tags = styled.div`
    display: flex;
    column-gap: 16px;
`

const Tag = styled.div`
    background-color: #FF6600;
    padding: 8px 16px;
    border-radius: 50px;
`