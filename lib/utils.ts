import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils/getHeadToHeadStats.ts

import { Transaction } from "@/types/types";

export type EncounterResult = "W" | "L";

export interface OpponentRecord {
  opponent: string;
  totalWins: number;
  totalLosses: number;
  encounters: EncounterResult[];
}

export function getHeadToHeadStats(
  transactions: Transaction[],
  userName: string
): OpponentRecord[] {
  // A map of opponentName -> { totalWins, totalLosses, encounters[] }
  const opponentStats: Record<
    string,
    { totalWins: number; totalLosses: number; encounters: EncounterResult[] }
  > = {};

  transactions.forEach((t) => {
    const userInTeam1 = t.team1.includes(userName);
    const userInTeam2 = t.team2.includes(userName);

    // Skip if user isn't in any team
    if (!userInTeam1 && !userInTeam2) return;

    // Determine which team won:
    //   If t.team1[0] === t.payer => team2 won; else team1 won
    const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";

    // Check if the user was on the winning team
    const userIsWinner =
      (userInTeam1 && winningTeam === "team1") ||
      (userInTeam2 && winningTeam === "team2");

    // The "opponents" are the people on the other team
    const opponents = userInTeam1 ? t.team2 : t.team1;

    opponents.forEach((opponent) => {
      if (!opponentStats[opponent]) {
        opponentStats[opponent] = {
          totalWins: 0,
          totalLosses: 0,
          encounters: [],
        };
      }

      if (userIsWinner) {
        // From the user's perspective: "W"
        opponentStats[opponent].totalWins += 1;
        opponentStats[opponent].encounters.push("W");
      } else {
        // From the user's perspective: "L"
        opponentStats[opponent].totalLosses += 1;
        opponentStats[opponent].encounters.push("L");
      }
    });
  });

  // Convert the object map to an array
  const statsArray = Object.entries(opponentStats).map(([opponent, record]) => ({
    opponent,
    totalWins: record.totalWins,
    totalLosses: record.totalLosses,
    encounters: record.encounters,
  }));

  // Sort alphabetically by opponent name (if desired)
  statsArray.sort((a, b) => a.opponent.localeCompare(b.opponent));

  return statsArray;
}


export const calculateSessionMetrics = (sessionTransactions: Transaction[], name:string) => {
  if (!sessionTransactions || sessionTransactions.length === 0 || !name) return
  // Total matches in the session
  const matchesPlayed = sessionTransactions.length;

  // Calculate net gain: add amount if user wins, subtract if user loses.
  const netAmount = sessionTransactions.reduce((acc, t) => {
    const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
    if (winningTeam === "team1") {
      if (t.team1.includes(name)) return acc + t.amount;
      else if (t.team2.includes(name)) return acc - t.amount;
    } else {
      if (t.team2.includes(name)) return acc + t.amount;
      else if (t.team1.includes(name)) return acc - t.amount;
    }
    return acc;
  }, 0);

  // Filter transactions for wins and losses
  const wins = sessionTransactions.filter((t) => {
    const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
    return winningTeam === "team1"
      ? t.team1.includes(name)
      : t.team2.includes(name);
  });
  const losses = sessionTransactions.filter((t) => {
    const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
    return winningTeam === "team1"
      ? t.team2.includes(name)
      : t.team1.includes(name);
  });

  // Count wins and losses
  const winCount = wins.length;
  const lossCount = losses.length;

  // Sum of amounts for wins and losses separately
  const totalWinsAmount = wins.reduce((acc, t) => acc + t.amount, 0);
  const totalLossesAmount = losses.reduce((acc, t) => acc + t.amount, 0);

  return {
    matchesPlayed,
    wins,
    losses,
    netAmount,
    winCount,
    lossCount,
    totalWinsAmount,
    totalLossesAmount,
  };
};
