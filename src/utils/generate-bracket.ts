export interface Participant {
  id: string;
  name: string;
}

export interface Bracket {
  id: string;
  index: number;
  round: number;
  winner: Participant | null;
  player1: Participant | null;
  player2: Participant | null;
}

export function generateBracket(totalPlayers: number): Bracket[] {
  if ((totalPlayers & (totalPlayers - 1)) !== 0) {
    throw new Error("Количество участников должно быть степенью двойки");
  }

  const roundsCount = Math.log2(totalPlayers);
  const bracket: Bracket[] = [];
  let nextMatchId = 0;

  const matchesRound1 = totalPlayers / 2;

  for (let i = 0; i < matchesRound1; i++) {
    bracket.push({
      id: String(nextMatchId++),
      index: i,
      round: 1,
      winner: null,
      player1: null,
      player2: null,
    });
  }

  let matchesInPreviousRound = matchesRound1;

  for (let round = 2; round <= roundsCount; round++) {
    const matchesThisRound = matchesInPreviousRound / 2;

    for (let i = 0; i < matchesThisRound; i++) {
      bracket.push({
        id: String(nextMatchId++),
        index: i,
        round: round,
        winner: null,
        player1: null,
        player2: null,
      });
    }

    matchesInPreviousRound = matchesThisRound;
  }

  return bracket;
}
