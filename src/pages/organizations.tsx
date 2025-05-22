import styled from "styled-components";
import { api } from "~/trpc/react";
import { Icon, IconEnum } from "~/app/_components/UI/icon.component";
import {UIH1} from "~/app/_components/UI/h1.component";
import Link from "next/link";
import {UIP} from "~/app/_components/UI/p.component";

export default function Organizations() {
  const organizationGetQuery = api.organization.getOrganizations.useQuery({
    skip: 0,
    take: 50,
  });

  if (organizationGetQuery.data == null) {
      return null
  }

  return (
    <Wrapper>
      <UIH1>Организации</UIH1>
      <List>
        {organizationGetQuery.data.length < 1
          ? <UIP>Организаций пока нет</UIP>
          : organizationGetQuery.data.map((organization) => (
              <Item key={organization.id} href={`/organizations/${organization.id}`}>
                <ItemGroup>{organization.name}</ItemGroup>
                <ItemGroup>
                  <Icon icon={IconEnum.ATTACHMENT_LINE} />
                  <MembersCounter>{organization.members.length}</MembersCounter>
                </ItemGroup>
              </Item>
            ))}
      </List>
    </Wrapper>
  );
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 24px;
    
    padding: 0 56px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  width: 100%;
`;

const Item = styled(Link)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  width: 100%;

  color: white;
  background: #111115;

  padding: 24px;

  font-size: 16px;

  &:hover {
    cursor: pointer;

    background: #151519;
  }
`;

const ItemGroup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const MembersCounter = styled.div`
  font-size: 14px;
  color: #d8d8d8;
`;
