
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

  // We'll store sets of partner names and opponent names
  const partnerSet = new Set<string>();
  const opponentSet = new Set<string>();

  // Lowercase for consistent matching
  const user = userName.trim().toLowerCase();

  for (const tx of transactions) {
    if (!tx.team1 || !tx.team2) {
      console.error("Transaction missing team data", tx);
      continue;
    }
    // If transaction is older than 30 days, skip
    const txDate = typeof tx?.timestamp === "string" ? parseISO(tx?.timestamp) : tx?.timestamp;
    if (!isAfter(txDate, monthStart)) {
        console.log("Transaction is older than 30 days, skipping", tx);
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

    if (userInTeam1) {
      // partners = team1 minus user; opponents = team2
      team1.forEach((p) => {
        if (p !== user) partnerSet.add(p);
      });
      team2.forEach((o) => opponentSet.add(o));
    } else if (userInTeam2) {
      // partners = team2 minus user; opponents = team1
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
    console.log(transactions)
    if (!transactions || transactions.length === 0 || !userName) return null;
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
  
    // If user has no transaction data at all
    if (!transactions || transactions.length === 0) {
      return <div className="text-slate-500">No transaction data found.</div>;
    }
  
    const { uniquePartnersThisMonth, uniqueOpponentsThisMonth, totalUniquePlayersThisMonth } =
      communityStats;
  
    // If everything is zero => no new partners or opponents
    if (!uniquePartnersThisMonth && !uniqueOpponentsThisMonth) {
      return <div className="text-slate-500 flex justify-center items-center">No new partners or opponents found.</div>;
    }
  
    return (
      <div className="flex flex-col items-center gap-4">
        {/* TOP: Unique Partners This Month */}
        <div className="flex flex-col items-center">
          <span className="text-3xl">🤝</span>
          <p className="text-sm mt-1 text-gray-500">Unique Partners this month</p>
          <p className="text-4xl font-bold text-gray-700">
            {uniquePartnersThisMonth}
          </p>
        </div>
  
        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-2" />
  
        {/* BOTTOM (2 columns): Opponents & Total */}
        <div className="flex justify-center gap-8 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-gray-500">Unique Opponents</span>
            <span className="text-lg font-bold text-gray-700">
              {uniqueOpponentsThisMonth}
            </span>
          </div>
  
          <div className="flex flex-col items-center">
            <span className="text-gray-500">Total Players</span>
            <span className="text-lg font-bold text-gray-700">
              {totalUniquePlayersThisMonth}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  export default NewPartnersCard;