"use client";

import styled from "styled-components";
import { UISelect } from "../app/_components/UI/select.component";
import { UIDataPicker } from "../app/_components/UI/data.picker.component";
import { UISearch } from "../app/_components/UI/search.component";
import { UIButton } from "~/app/_components/UI/button.component";
import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Loader } from "~/app/_components/loader.component";
import { useRouter } from "next/router";

export default function Events() {
    const router = useRouter();
    const [isLoading, setLoadingScreen] = useState<boolean>(true);
    const matchGetMutation = api.match.get.useMutation()
    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        matchGetMutation.mutate(
            undefined,
            {
                onSuccess: (data) => {
                    setMatches(data.matches);
                    setLoadingScreen(false)
                }
            }
        );
    }, []);

    console.log(matches)

    return (
        <>
        { isLoading ? (<Loader/>) : (
            <Wrapper>
                <h1>События</h1>
                <EventsFilter>
                    <UISelect options={['Все', 'Мужчины', 'Женщины', 'Дети']}/>
                    <UISelect options={['Все', 'Международный', 'Национальный', 'Тур ТТА', 'Штат открывается', 'Разнообразие и равенство']}/>
                    <UIDataPicker placeholder="Дата начала турнира"></UIDataPicker>
                    <UISearch placeholder="Название"/>
                    <UIButton>Найти</UIButton>
                </EventsFilter>
                <EventsList>
                    {/* <Event>
                        <EventTitle>
                            <h2>Кубок Омска</h2>
                            <p>Сб 5 апр 2025 9:00 - 20:00</p>
                            <p>Настольный теннис | Стадион Шинник</p>
                        </EventTitle>
                        <EventStatus>Полуфинал</EventStatus>
                    </Event>
                    <Event>
                        <EventTitle>
                            <h2>Горящий мячик</h2>
                            <p>Пн 31 мар 2025 11:00 - 22:00</p>
                            <p>Настольный теннис | ООО ПФ «Антей»</p>
                        </EventTitle>
                        <EventStatus style={{backgroundColor:"#1a1a20"}}>Окончено</EventStatus>
                    </Event>
                    <Event>
                        <EventTitle>
                            <h2>Турнир ветеранов</h2>
                            <p>27 мар 2025 8:00 - 17:00</p>
                            <p>Настольный теннис | Стадион Шинник</p>
                        </EventTitle>
                        <EventStatus style={{backgroundColor:"#1a1a20"}}>Окончено</EventStatus>
                    </Event> */}
                    {
                        matches.map((match) => (
                            <Event key={match.id} onClick={() => {router.push(`/match/${match.id}`)}}>
                                <EventTitle>
                                    <h2>{match.name}</h2>
                                    <p>{match.date}</p>
                                    <p>{match.category}</p>
                                </EventTitle>
                            </Event>
                        ))
                    }
                </EventsList>
            </Wrapper>
        )}
        </>
    );
}

const Wrapper = styled.div`
    color: white;
    padding: 0 56px;
    display: flex;
    flex-direction: column;
    row-gap: 24px;

    hr {
        border: 0;
        border-top: 1px solid #1c1c23;
    }
`

const EventsFilter = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    column-gap: 8px;
`

const EventsList = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 24px;
`

const Event = styled.div`
    background-color: #111115;
    padding: 24px;

    display: flex;
    justify-content: space-between;

    cursor: pointer;

    h2 {
        transition: .2s color;
    }

    &:hover {
        h2 {
            color: #FF6600;
            transition: .2s color;
        }
    }
`

const EventTitle = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 8px;

    p {
        color: #A6A6A6;
    }
`

const EventStatus = styled.div`
    background-color: #FF6600;
    padding: 8px 24px;
    align-self: flex-start;
`