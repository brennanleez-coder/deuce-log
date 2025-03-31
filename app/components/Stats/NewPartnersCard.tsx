"use client";

import React, { useEffect, useState } from "react";
import { subDays, isAfter, parseISO } from "date-fns";
import { Transaction } from "@prisma/client";

export function computeCommunityStats(
  transactions: Transaction[],
  userName: string
): {
  uniquePartnersThisMonth: number;
  uniqueOpponentsThisMonth: number;
  totalUniquePlayersThisMonth: number;
} {
  const now = new Date();
  const monthStart = subDays(now, 30);

  const partnerSet = new Set<string>();
  const opponentSet = new Set<string>();

  const user = userName.trim().toLowerCase();

  for (const tx of transactions) {
    if (!tx.team1 || !tx.team2) {
      console.error("Transaction missing team data", tx);
      continue;
    }
    // If transaction is older than 30 days, skip
    const txDate =
      typeof tx.timestamp === "string" ? parseISO(tx.timestamp) : tx.timestamp;
    if (!isAfter(txDate, monthStart)) {
      continue;
    }

    // Confirm user is actually in this transaction
    const team1 = tx.team1.map((p: string) => p.toLowerCase());
    const team2 = tx.team2.map((p: string) => p.toLowerCase());
    const userInTeam1 = team1.includes(user);
    const userInTeam2 = team2.includes(user);

    // If user not in either team, skip
    if (!userInTeam1 && !userInTeam2) {
      continue;
    }

    // Identify partners vs. opponents
    if (userInTeam1) {
      // partners = team1 minus user; opponents = team2
      team1.forEach((p) => {
        if (p !== user) partnerSet.add(p);
      });
      team2.forEach((o) => opponentSet.add(o));
    } else {
      // userInTeam2: partners = team2 minus user; opponents = team1
      team2.forEach((p) => {
        if (p !== user) partnerSet.add(p);
      });
      team1.forEach((o) => opponentSet.add(o));
    }
  }

  const uniquePartnersThisMonth = partnerSet.size;
  const uniqueOpponentsThisMonth = opponentSet.size;
  const totalUniquePlayersThisMonth = partnerSet.size + opponentSet.size;

  return {
    uniquePartnersThisMonth,
    uniqueOpponentsThisMonth,
    totalUniquePlayersThisMonth,
  };
}

interface NewPartnersCardProps {
  transactions: Transaction[];
  userName: string;
}

const NewPartnersCard: React.FC<NewPartnersCardProps> = ({
  transactions,
  userName,
}) => {
  const [communityStats, setCommunityStats] = useState({
    uniquePartnersThisMonth: 0,
    uniqueOpponentsThisMonth: 0,
    totalUniquePlayersThisMonth: 0,
  });

  useEffect(() => {
    if (!transactions || transactions.length === 0 || !userName) return;
    const result = computeCommunityStats(transactions, userName);
    setCommunityStats(result);
  }, [transactions, userName]);

  // Early return if no data
  if (!transactions || transactions.length === 0) {
    return <div className="text-slate-500 text-sm">No matches found.</div>;
  }

  const {
    uniquePartnersThisMonth,
    uniqueOpponentsThisMonth,
    totalUniquePlayersThisMonth,
  } = communityStats;

  // If everything is zero => no new partners or opponents
  if (!uniquePartnersThisMonth && !uniqueOpponentsThisMonth) {
    return (
      <div className="text-slate-500 flex justify-center items-center">
        No new partners or opponents found.
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* EXACT SAME TILTED LAYOUT AS STREAKCARD */}
      <div className="relative bg-white border border-gray-200 rounded-md p-4 shadow-sm transform rotate-1 hover:rotate-0 transition-transform duration-300">
        {/* FLOATING BADGE: Unique Partners */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 p-3 rounded-full shadow-md bg-white border border-gray-100 flex flex-col items-center w-24">
          <span className="text-2xl">🤝</span>
          <p className="text-xs text-gray-500">Partners</p>
          <p className="text-xl font-bold text-gray-700">
            {uniquePartnersThisMonth}
          </p>
        </div>

        {/* SIDE-BY-SIDE BOXES BELOW */}
        <div className="pt-10 flex items-center justify-around gap-3">
          {/* Unique Opponents */}
          <div className="bg-gray-50 w-full p-2 rounded-md shadow text-center">
            <p className="text-sm text-gray-400 mb-1">Opponents</p>
            <div className="flex flex-col items-center">
              <span className="text-xl">⚔️</span>
              <span className="text-gray-700 text-lg font-semibold">
                {uniqueOpponentsThisMonth}
              </span>
            </div>
          </div>

          {/* Total Players */}
          <div className="bg-gray-50 w-full p-2 rounded-md shadow text-center">
            <p className="text-sm text-gray-400 mb-1">Total Players</p>
            <div className="flex flex-col items-center">
              <span className="text-xl">👥</span>
              <span className="text-gray-700 text-lg font-semibold">
                {totalUniquePlayersThisMonth}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPartnersCard;
