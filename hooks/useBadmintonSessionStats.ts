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
  bestPartners: { name: string; wins: number; losses: number }[] | null;
  worstPartners: { name: string; wins: number; losses: number }[] | null;
  toughestOpponents: { name: string; wins: number; losses: number }[] | null;
  mostDefeatedOpponents: { name: string; wins: number; losses: number }[] | null;
}

export const useBadmintonSessionStats = (
  transactions: Transaction[],
  userName: string | null
): SessionStats => {
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
        bestPartners: null,
        worstPartners: null,
        toughestOpponents: null,
        mostDefeatedOpponents: null,
      };
    }

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

    // Opponent stats
    const opponentStats: Record<string, { wins: number; losses: number }> = {};

    transactions.forEach((t) => {
      const userInTeam1 = t.team1.includes(userName);
      const userInTeam2 = t.team2.includes(userName);

      if (!userInTeam1 && !userInTeam2) return;

      const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
      const userIsWinner =
        (userInTeam1 && winningTeam === "team1") ||
        (userInTeam2 && winningTeam === "team2");

      const opponents = userInTeam1 ? t.team2 : t.team1;

      opponents.forEach((opponent) => {
        if (!opponentStats[opponent]) {
          opponentStats[opponent] = { wins: 0, losses: 0 };
        }
        if (userIsWinner) {
          opponentStats[opponent].wins += 1;
        } else {
          opponentStats[opponent].losses += 1;
        }
      });
    });

    const toughestOpponents = Object.entries(opponentStats)
      .filter(([_, stats]) => stats.losses > stats.wins)
      .sort((a, b) => b[1].losses - a[1].wins)
      .slice(0, 2)
      .map(([name, stats]) => ({ name, wins: stats.wins, losses: stats.losses }));

    const mostDefeatedOpponents = Object.entries(opponentStats)
      .filter(([_, stats]) => stats.wins > stats.losses)
      .sort((a, b) => b[1].wins - a[1].losses)
      .slice(0, 2)
      .map(([name, stats]) => ({ name, wins: stats.wins, losses: stats.losses }));

    // Ensure at least one "toughest opponent" appears if the user has a single loss
    if (toughestOpponents.length === 0) {
      const singleLossOpponent = Object.entries(opponentStats).find(
        ([_, stats]) => stats.losses > 0
      );
      if (singleLossOpponent) {
        const [name, stats] = singleLossOpponent;
        toughestOpponents.push({ name, wins: stats.wins, losses: stats.losses });
      }
    }
    if (mostDefeatedOpponents.length === 0) {
      const singleWinOpponent = Object.entries(opponentStats).find(
        ([_, stats]) => stats.losses > 0
      );
      if (singleWinOpponent) {
        const [name, stats] = singleWinOpponent;
        mostDefeatedOpponents.push({ name, wins: stats.wins, losses: stats.losses });
      }
    }

    const { bestPartners, worstPartners } = getBestAndWorstPartners(
      transactions,
      userName
    );

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
      toughestOpponents,
      mostDefeatedOpponents,
    };
  }, [transactions, userName]);
};
