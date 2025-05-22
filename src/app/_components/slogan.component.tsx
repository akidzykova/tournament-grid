"use client";

import type React from "react"
import styled from "styled-components";
import {useCallback, useContext, useMemo} from "react";
import {UserContext} from "~/contexts/user.context";
import {UIButton} from "~/app/_components/UI/button.component";
import {BackgroundImageComponent} from "~/app/_components/background-image.component";

export const SloganComponent: React.FC = () => {
    const userContext = useContext(UserContext)
    const { isAdmin } = useMemo(() => {
        const isAdmin = userContext.userData ? userContext.userData.roles.includes('admin') : false

        return {
            isAdmin: isAdmin,
        }
    }, [userContext.userData])

    const handleCreateTournament = useCallback(() => {

    }, [])

    const handleJoinToTournament = useCallback(() => {
        alert('test')
    }, [])

    return (
        <SloganStyle>
            <h1>
                Организуй и управляй своим<br/>
                турниром по настольному<br/>
                теннису!
            </h1>
            <BackgroundImageComponent />
        </SloganStyle>
    );
}

const SloganStyle = styled.div`
    position: relative;
    
    padding: 0 56px;
    
    width: 100%;
    height: calc(100vh - (48px * 3));

    & h1 {
        margin: 0 0 48px 0;
        color: white;
        font-size: 64px;
    }
`

const ButtonContainer = styled.div`
    width: fit-content;
`