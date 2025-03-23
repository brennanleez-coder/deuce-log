import { Transaction } from "@prisma/client";

export interface SessionStats {
  matchesPlayed: number;
  netAmount: number;
  winCount: number;
  lossCount: number;
}

export const useAllBadmintonSessionStats = (
  transactions: Transaction[],
  userName: string | null
): Record<string, SessionStats> => {
  if (!transactions || transactions.length === 0 || !userName) {
    return {};
  }
  console.log("session transactions", transactions);
  const sessionStats: Record<string, SessionStats> = {};
  console.log(transactions)
  transactions.forEach((t) => {
    const sessionId = t?.sessionId;
    if (!sessionStats[sessionId]) {
      sessionStats[sessionId] = {
        matchesPlayed: 0,
        netAmount: 0,
        winCount: 0,
        lossCount: 0,
      };
    }

    sessionStats[sessionId].matchesPlayed += 1;

    const winningTeam = t?.team1[0] === t?.payer ? "team2" : "team1";

    if (winningTeam === "team1") {
      if (t?.team1.includes(userName)) {
        sessionStats[sessionId].winCount += 1;
        sessionStats[sessionId].netAmount += t?.amount;
      } else if (t?.team2.includes(userName)) {
        sessionStats[sessionId].lossCount += 1;
        sessionStats[sessionId].netAmount -= t?.amount;
      }
    } else {
      if (t?.team2.includes(userName)) {
        sessionStats[sessionId].winCount += 1;
        sessionStats[sessionId].netAmount += t?.amount;
      } else if (t?.team1.includes(userName)) {
        sessionStats[sessionId].lossCount += 1;
        sessionStats[sessionId].netAmount -= t?.amount;
      }
    }
  });
  return sessionStats;
};
