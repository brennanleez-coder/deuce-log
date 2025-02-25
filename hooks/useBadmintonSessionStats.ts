import { useMemo } from "react";
import { Transaction } from "@/types/types";
import { getBestAndWorstPartners } from "@/lib/utils";

interface SessionStats {
  matchesPlayed: number;
  netAmount: number;
  winCount: number;
  lossCount: number;
  totalWinsAmount: number;
  totalLossesAmount: number;
  wins: Transaction[];
  losses: Transaction[];
  bestPartner: string | null;
  worstPartner: string | null;
}

/**
 * Custom Hook to compute badminton session statistics.
 */
export const useBadmintonSessionStats = (transactions: Transaction[], userName: string | null): SessionStats => {
  return useMemo(() => {
    if (!transactions || transactions.length === 0 || !userName) {
      return {
        matchesPlayed: 0,
        netAmount: 0,
        winCount: 0,
        lossCount: 0,
        totalWinsAmount: 0,
        totalLossesAmount: 0,
        wins: [],
        losses: [],
        bestPartner: null,
        worstPartner: null,
      };
    }

    let partnerWinCount: Record<string, number> = {};
    let partnerLossCount: Record<string, number> = {};

    const netAmount = transactions.reduce((acc, t) => {
      const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
      if (winningTeam === "team1") {
        if (t.team1.includes(userName)) return acc + t.amount;
        else if (t.team2.includes(userName)) return acc - t.amount;
      } else {
        if (t.team2.includes(userName)) return acc + t.amount;
        else if (t.team1.includes(userName)) return acc - t.amount;
      }
      return acc;
    }, 0);

    const wins = transactions.filter((t) => {
      const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
      return winningTeam === "team1"
        ? t.team1.includes(userName)
        : t.team2.includes(userName);
    });

    const losses = transactions.filter((t) => {
      const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
      return winningTeam === "team1"
        ? t.team2.includes(userName)
        : t.team1.includes(userName);
    });

    // Count wins and losses per teammate
    transactions.forEach((t) => {
      const isWin = wins.includes(t);
      const isLoss = losses.includes(t);
      const team = t.team1.includes(userName) ? t.team1 : t.team2;
      const partners = team.filter((player) => player !== userName);

      partners.forEach((partner) => {
        if (isWin) {
          partnerWinCount[partner] = (partnerWinCount[partner] || 0) + 1;
        }
        if (isLoss) {
          partnerLossCount[partner] = (partnerLossCount[partner] || 0) + 1;
        }
      });
    });



    const { bestPartners, worstPartners } = getBestAndWorstPartners(transactions, userName);
    return {
      matchesPlayed: transactions.length,
      netAmount,
      winCount: wins.length,
      lossCount: losses.length,
      totalWinsAmount: wins.reduce((acc, t) => acc + t.amount, 0),
      totalLossesAmount: losses.reduce((acc, t) => acc + t.amount, 0),
      wins,
      losses,
      bestPartners,
      worstPartners,
    };
  }, [transactions, userName]);
};
