import React, { useMemo, useCallback } from "react";
import styled from "styled-components";
import type {Bracket, Participant} from "~/utils/generate-bracket";

const PADDING = 16;
const SLOT_HEIGHT = 120;
const CONNECTOR_BEFORE = 20;
const CONNECTOR_AFTER = 40;

export type Match = Bracket

interface BracketProps {
  matches: Bracket[];
  participantsCount: number;
  onChange: (matches: Match[]) => void;
}

export const SingleEliminationBracket: React.FC<BracketProps> = ({
  matches,
  participantsCount,
  onChange,
}) => {
  // вычисляем количество раундов и размеры
  const { rounds, width, height, cellWidth, slotWidth, slotStep } =
    useMemo(() => {
      if ((participantsCount & (participantsCount - 1)) !== 0) {
        throw new Error("participantsCount must be a power of two");
      }
      const rounds = Math.log2(participantsCount) + 1;
      const width = rounds * SLOT_HEIGHT * 2;
      const height = participantsCount * SLOT_HEIGHT;
      const cellWidth = width / rounds;
      const slotWidth = cellWidth - PADDING * 2;
      const slotStep = slotWidth + CONNECTOR_BEFORE + CONNECTOR_AFTER;
      return { rounds, width, height, cellWidth, slotWidth, slotStep };
    }, [participantsCount]);

  // координаты по X для данного раунда
  const getX = useCallback(
    (round: number) => {
      return PADDING + (round - 1) * slotStep;
    },
    [slotStep],
  );

  // координаты по Y для слота (round, index)
  const getY = useCallback((round: number, index: number) => {
    const groupSize = Math.pow(2, round - 1);
    return index * groupSize * SLOT_HEIGHT + (groupSize * SLOT_HEIGHT) / 2;
  }, []);

  const handleSelectWinner = useCallback(
    (match: Match, player: Participant) => {
      const _matches = [...matches];

      const currentMatchIndex = _matches.findIndex((m) => m.id === match.id);
      const currentMatch = _matches[currentMatchIndex]!;

      currentMatch.winner = player;

      function getParent(m: Match): Match | undefined {
        return _matches.find(
          (pm) =>
            pm.round === m.round + 1 && pm.index === Math.floor(m.index / 2),
        );
      }

      const secondMatch = getParent(currentMatch);

      if (secondMatch == null) {
        onChange(_matches);
        return;
      }

      const slotKey = match.index % 2 === 0 ? "player1" : "player2";
      const currentPlayer = secondMatch[slotKey];

      if (currentPlayer != null) {
          secondMatch.winner =
              secondMatch.winner === currentPlayer
                  ? player
                  : secondMatch.winner;
      }

      secondMatch[slotKey] = player;

      let parent = getParent(secondMatch);

      while (currentPlayer != null && parent) {
        if (parent.player1 === currentPlayer) {
          parent.winner =
            parent.winner === parent.player1 ? player : parent.winner;
          parent.player1 = player;
        } else if (parent.player2 === currentPlayer) {
          parent.winner =
            parent.winner === parent.player2 ? player : parent.winner;
          parent.player2 = player;
        } else {
          break;
        }

        parent = getParent(parent);
      }

      onChange(_matches);
    },
    [matches, onChange],
  );

  return (
    <BracketContainer>
      <Svg width={width + PADDING * 2} height={height + PADDING * 2}>
        {matches.map((match) => {
          const x = getX(match.round);
          const y = getY(match.round, match.index);
          return (
            <StyledG key={match.id}>
              <StyledRect
                x={x}
                y={y - SLOT_HEIGHT / 4}
                width={slotWidth}
                height={SLOT_HEIGHT / 2}
              />
              <ForeignBox
                x={x}
                y={y - SLOT_HEIGHT / 4}
                width={slotWidth}
                height={SLOT_HEIGHT / 2}
              >
                <TextWrapper>
                  {["player1", "player2"].map((key) => {
                    const participant = match[key as "player1" | "player2"];
                    if (!participant) return null;
                    const isWinner = match.winner?.id === participant.id;
                    return (
                      <TextItem
                        key={participant.id}
                        winner={isWinner}
                        onClick={() => handleSelectWinner(match, participant)}
                      >
                        {participant.name}
                      </TextItem>
                    );
                  })}
                </TextWrapper>
              </ForeignBox>
            </StyledG>
          );
        })}

        {/* Линии, соединяющие слоты */}
        {matches.map((match) => {
          if (match.round === rounds) return null;
          const fromX = getX(match.round) + (cellWidth - PADDING * 2);
          const fromY = getY(match.round, match.index);
          const parentIndex = Math.floor(match.index / 2);
          const nextMatch = matches.find(
            (m) => m.round === match.round + 1 && m.index === parentIndex,
          );
          if (!nextMatch) return null;
          const toX = getX(nextMatch.round);
          const toY = getY(nextMatch.round, nextMatch.index);
          const midX1 = fromX + CONNECTOR_BEFORE;
          const midX2 = midX1 + CONNECTOR_AFTER;
          return (
            <StyledLine
              key={`${match.id}-line`}
              d={[
                `M${fromX},${fromY}`,
                `L${midX1},${fromY}`,
                `L${midX1},${toY}`,
                `L${midX2},${toY}`,
                `L${toX},${toY}`,
              ].join(" ")}
            />
          );
        })}
      </Svg>
    </BracketContainer>
  );
};

const Svg = styled.svg`
  overflow: visible;
`;

const StyledLine = styled.path`
  fill: none;
  stroke: white;
`;

const StyledRect = styled.rect`
  rx: 8;
  ry: 8;
  fill: #111115;
  stroke: #ffffff;
`;

const StyledG = styled.g`
  &:hover {
    ${StyledRect} {
      fill: #1c1c20 !important;
    }
  }
`;

const BracketContainer = styled.div`
  overflow: auto;
  padding: ${PADDING}px;
`;

const ForeignBox = styled.foreignObject`
  overflow: visible;
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;

  width: 100%;
  height: 100%;
  padding: 8px;
`;

const TextItem = styled.div<{ winner?: boolean }>`
  user-select: none;
  font-size: 16px;
  color: #dddddd;
  font-weight: ${(props) => (props.winner ? "bold" : "normal")};

  &:hover {
    cursor: pointer;
    color: #ffffff;
  }
`;
