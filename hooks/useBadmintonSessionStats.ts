import { useMemo } from "react";
import { Transaction } from "@prisma/client";
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
    // Return default stats if there are no transactions or no userName.
    if (!transactions?.length || !userName) {
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

    let netAmount = 0;
    let winCount = 0;
    let lossCount = 0;
    let totalWinsAmount = 0;
    let totalLossesAmount = 0;
    const wins: Transaction[] = [];
    const losses: Transaction[] = [];
    const opponentStats: Record<string, { wins: number; losses: number }> = {};

    transactions.forEach((t) => {
      const userInTeam1 = t.team1.includes(userName);
      const userInTeam2 = t.team2.includes(userName);

      // Skip transactions where the user is not involved.
      if (!userInTeam1 && !userInTeam2) return;

      // Determine winning team based on your business logic.
      const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
      const userIsWinner =
        (userInTeam1 && winningTeam === "team1") ||
        (userInTeam2 && winningTeam === "team2");

      // Update stats based on whether the user won.
      if (userIsWinner) {
        netAmount += t.amount;
        winCount++;
        totalWinsAmount += t.amount;
        wins.push(t);
      } else {
        netAmount -= t.amount;
        lossCount++;
        totalLossesAmount += t.amount;
        losses.push(t);
      }

      // Determine opponents (the team the user is not in).
      const opponents = userInTeam1 ? t.team2 : t.team1;
      opponents.forEach((opponent) => {
        if (!opponentStats[opponent]) {
          opponentStats[opponent] = { wins: 0, losses: 0 };
        }
        if (userIsWinner) {
          opponentStats[opponent].wins++;
        } else {
          opponentStats[opponent].losses++;
        }
      });
    });

    const MIN_GAMES = 3;

    // Helper function to pick top opponents based on filter and sort functions.
    const pickOpponents = (
      filterFn: (stats: { wins: number; losses: number; totalGames: number; winRate: number }) => boolean,
      sortFn: (
        a: { wins: number; losses: number; totalGames: number; winRate: number },
        b: { wins: number; losses: number; totalGames: number; winRate: number }
      ) => number,
      limit: number = 2
    ) => {
      return Object.entries(opponentStats)
        .map(([name, stats]) => {
          const totalGames = stats.wins + stats.losses;
          const winRate = totalGames > 0 ? stats.wins / totalGames : 0;
          return { name, ...stats, totalGames, winRate };
        })
        .filter((stats) => stats.totalGames >= MIN_GAMES && filterFn(stats))
        .sort((a, b) => sortFn(a, b))
        .slice(0, limit);
    };

    // Determine toughest opponents: low win rate (you lose to them more)
    const toughestOpponents = pickOpponents(
      (stats) => stats.winRate < 0.5,
      (a, b) => a.winRate - b.winRate || b.losses - a.losses
    );

    // Determine most defeated opponents: high win rate (you beat them more)
    const mostDefeatedOpponents = pickOpponents(
      (stats) => stats.winRate > 0.5,
      (a, b) => b.winRate - a.winRate || b.wins - a.wins
    );

    // Fallback: Ensure at least one opponent is returned if none match the criteria.
    if (toughestOpponents.length === 0) {
      const fallback = Object.entries(opponentStats).find(([_, stats]) => stats.losses > 0);
      if (fallback) {
        const [name, stats] = fallback;
        toughestOpponents.push({
          name,
          wins: stats.wins,
          losses: stats.losses,
          totalGames: stats.wins + stats.losses,
          winRate: stats.wins + stats.losses > 0 ? stats.wins / (stats.wins + stats.losses) : 0,
        });
      }
    }
    if (mostDefeatedOpponents.length === 0) {
      const fallback = Object.entries(opponentStats).find(([_, stats]) => stats.wins > 0);
      if (fallback) {
        const [name, stats] = fallback;
        mostDefeatedOpponents.push({
          name,
          wins: stats.wins,
          losses: stats.losses,
          totalGames: stats.wins + stats.losses,
          winRate: stats.wins + stats.losses > 0 ? stats.wins / (stats.wins + stats.losses) : 0,
        });
      }
    }
    // Get best and worst partners from the helper function.
    const { bestPartners, worstPartners } = getBestAndWorstPartners(transactions, userName);

    return {
      matchesPlayed: transactions.length,
      netAmount,
      winCount,
      lossCount,
      totalWinsAmount,
      totalLossesAmount,
      wins,
      losses,
      bestPartners,
      worstPartners,
      toughestOpponents,
      mostDefeatedOpponents,
    };
  }, [transactions, userName]);
};
