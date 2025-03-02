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


export const getBestAndWorstPartners = (
  transactions: Transaction[],
  userName: string
) => {
  // 1. Collect (wins, losses) for each partner
  const partnerStats: Record<string, { wins: number; losses: number }> = {};

  transactions.forEach((t) => {
    if (!t.team1 || !t.team2) return;

    const userInTeam1 = Array.isArray(t.team1) && t.team1.includes(userName);
    const userInTeam2 = Array.isArray(t.team2) && t.team2.includes(userName);

    // If user is not in either team, skip
    if (!userInTeam1 && !userInTeam2) return;

    // Determine winning team
    const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";

    // Identify which team the user is on
    const userTeam = userInTeam1 ? "team1" : "team2";

    // Check if the user's team won
    const isWin = userTeam === winningTeam;

    // Get the user's partners (excluding themselves)
    const partners = (t[userTeam] || []).filter((p) => p !== userName);

    // Update stats for each partner
    partners.forEach((partner) => {
      if (!partnerStats[partner]) {
        partnerStats[partner] = { wins: 0, losses: 0 };
      }
      if (isWin) {
        partnerStats[partner].wins += 1;
      } else {
        partnerStats[partner].losses += 1;
      }
    });
  });

  // 2. Convert partnerStats to an array with a computed ratio
  const statsArray = Object.entries(partnerStats).map(([name, { wins, losses }]) => {
    const totalGames = wins + losses;
    const ratio = totalGames > 0 ? wins / totalGames : 0;
    return {
      name,
      wins,
      losses,
      totalGames,
      ratio,
    };
  });

  // 3. Identify best partners by ratio (descending) and prioritize more games played
  const bestPartners = [...statsArray]
    .sort((a, b) => b.ratio - a.ratio || b.totalGames - a.totalGames)
    .slice(0, 2);

  // 4. Identify worst partners by ratio (ascending) and prioritize more losses
  const worstPartners = [...statsArray]
    .sort((a, b) => a.ratio - b.ratio || b.losses - a.losses)
    .slice(0, 2);

  return { bestPartners, worstPartners };
};
