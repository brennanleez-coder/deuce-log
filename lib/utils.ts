import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Transaction } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type EncounterResult = "W" | "L";

export interface OpponentRecord {
  opponent: string;
  totalWins: number;
  totalLosses: number;
  encounters: EncounterResult[];
}

export const getTimeAwareGreeting = (name:string) =>{
  const now = new Date();
  const currentHour = now.getHours();
  if (currentHour < 12) {
    return `Good morning, ${name}`;
  } else if (currentHour < 18) {
    return `Good afternoon, ${name}`;
  } else {
    return `Good evening, ${name}`;
  }
}
export function getHeadToHeadStats(
  transactions: Transaction[],
  userName: string
): OpponentRecord[] {
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

interface PartnerRecord {
  partner: string;
  totalWins: number;
  totalLosses: number;
  encounters: EncounterResult[];
}
export function getPartnerStats(
  transactions: Transaction[],
  userName: string
): PartnerRecord[] {
  // A map of partnerName -> { totalWins, totalLosses, encounters[] }
  const partnerStats: Record<
    string,
    { totalWins: number; totalLosses: number; encounters: EncounterResult[] }
  > = {};

  transactions.forEach((t) => {
    const userInTeam1 = t.team1.includes(userName);
    const userInTeam2 = t.team2.includes(userName);

    // Skip if user isn't in any team
    if (!userInTeam1 && !userInTeam2) return;

    // Determine which team won:
    const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";

    // Check if the user was on the winning team
    const userIsWinner =
      (userInTeam1 && winningTeam === "team1") ||
      (userInTeam2 && winningTeam === "team2");

    // The "partners" are the other players on the user's team
    const partners = userInTeam1 ? t.team1.filter((p) => p !== userName) : t.team2.filter((p) => p !== userName);

    partners.forEach((partner) => {
      if (!partnerStats[partner]) {
        partnerStats[partner] = {
          totalWins: 0,
          totalLosses: 0,
          encounters: [],
        };
      }

      if (userIsWinner) {
        // From the user's perspective: "W"
        partnerStats[partner].totalWins += 1;
        partnerStats[partner].encounters.push("W");
      } else {
        // From the user's perspective: "L"
        partnerStats[partner].totalLosses += 1;
        partnerStats[partner].encounters.push("L");
      }
    });
  });

  // Convert the object map to an array
  const statsArray = Object.entries(partnerStats).map(([partner, record]) => ({
    partner,
    totalWins: record.totalWins,
    totalLosses: record.totalLosses,
    encounters: record.encounters,
  }));

  // Sort alphabetically by partner name
  statsArray.sort((a, b) => a.partner.localeCompare(b.partner));

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

  // 2. Convert partnerStats to an array with computed Elo-like score
  const statsArray = Object.entries(partnerStats).map(([name, { wins, losses }]) => {
    const totalGames = wins + losses;
    const eloScore = wins - 0.5 * losses;
    return {
      name,
      wins,
      losses,
      totalGames,
      eloScore,
    };
  });

  // 3. Best partners: positive Elo score only
  const bestPartners = statsArray
    .filter((p) => p.eloScore > 0)
    .sort((a, b) => b.eloScore - a.eloScore || b.totalGames - a.totalGames)
    .slice(0, 2);

  // 4. Worst partners: negative Elo score only
  const worstPartners = statsArray
    .filter((p) => p.eloScore < 0)
    .sort((a, b) => a.eloScore - b.eloScore || b.losses - a.losses)
    .slice(0, 2);

  return { bestPartners, worstPartners };
};

