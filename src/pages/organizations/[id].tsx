import styled, { css } from "styled-components";
import { useRouter } from "next/router";
import { api } from "~/trpc/react";
import { UIH1 } from "~/app/_components/UI/h1.component";
import React, { useMemo, useState } from "react";
import { UIH2 } from "~/app/_components/UI/h2.component";
import { formatJoinedDate } from "~/utils/date";
import { UIP } from "~/app/_components/UI/p.component";
import { UIH3 } from "~/app/_components/UI/h3.component";

enum Tab {
  INFORMATION,
  MATCHES,
  MEMBERS,
}

export default function Organization() {
  const router = useRouter();
  const { id } = router.query;

  const organizationGetQuery = api.organization.getOrganization.useQuery({
    id: id as string,
  });

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

  if (organizationGetQuery.data == null) {
    return null;
  }

  return (
    <Wrapper>
      <UIH1>
        <span>Организация </span>
        <OrganizationText>{organizationGetQuery.data.name}</OrganizationText>
      </UIH1>
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
          История матчей
        </NavButton>
        <NavButton
          active={tab === Tab.MEMBERS}
          onClick={() => setTab(Tab.MEMBERS)}
        >
          Участники
        </NavButton>
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
  const router = useRouter();
  const { id } = router.query;

  const organizationGetQuery = api.organization.getOrganization.useQuery({
    id: id as string,
  });

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
      <UIH3>Основатель</UIH3>
      <Section>
        <UIP>@{organizationGetQuery.data.founder.login}</UIP>
      </Section>
    </>
  );
};

const MatchesContent: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const organizationGetQuery = api.organization.getOrganization.useQuery({
    id: id as string,
  });

  if (organizationGetQuery.data == null) {
    return null;
  }

  return (
    <>
      <UIH2>История матчей</UIH2>
      <MatchList>
        {organizationGetQuery.data.matches.length < 1 ? (
          <UIP>Матчей пока нет</UIP>
        ) : (
          organizationGetQuery.data.matches.map((match) => (
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
  const router = useRouter();
  const { id } = router.query;

  const organizationGetQuery = api.organization.getOrganization.useQuery({
    id: id as string,
  });

  if (organizationGetQuery.data == null) {
    return null;
  }

  return (
    <>
      <UIH2>Участники</UIH2>
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
