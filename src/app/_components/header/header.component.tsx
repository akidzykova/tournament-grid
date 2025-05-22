"use client";

import React, {useContext, useMemo} from 'react';
import styled from 'styled-components'
import { UserContext } from '~/contexts/user.context';
import Link from "next/link";

export const HeaderComponent: React.FC = () => {
    const userContext = useContext(UserContext);

    const { UserLink } = useMemo(() => {
        if (userContext.userData == null) {
            return {
                UserLink: <Link href='/authentication'>Авторизация</Link>
            }
        }
        
        return {
            UserLink: <Link href='/profile'>Личный кабинет</Link>
        }
    }, [userContext.userData])

    return (
        <HeaderStyle>
            <Link href='/'>
                <img src='/logo.png'></img>
            </Link>
            <nav>
                <Link href='/events'>
                    События
                </Link>
                <Link href='/organizations'>
                    Организации
                </Link>
            </nav>
            <nav>
                {UserLink}
            </nav>
        </HeaderStyle>
    );
}

const HeaderStyle = styled.header`
    z-index: 100;
    
    color: #fff;
    padding: 48px 56px;
    display: flex;
    justify-content: space-between;

    & nav {
        display: flex;
        column-gap: 48px;
        align-items: center;
    }

    a {
        cursor: pointer;
        transition: 0.2s;
    }

    a:hover {
        color: #FF6600;
        transition: 0.2s;
    }
`