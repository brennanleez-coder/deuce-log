"use client";

import React, { useEffect, useState } from "react";
import { isWithinInterval, startOfWeek, endOfWeek, parseISO } from "date-fns";

function computeStreakStats(sessions: any[], userName: string) {
  const allTransactions = sessions.flatMap((s) => s.transactions || []);
  const userMatches = allTransactions
    .map((tx) => ({
      result: tx.team1.includes(tx.payer) ? "loss" : "win",
      timestamp: new Date(tx.timestamp),
    }))
    .filter((m) => m.result !== "none")
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  if (userMatches.length === 0) {
    return {
      currentStreakCount: 0,
      currentStreakType: "none",
      longestWinStreak: 0,
      longestLossStreak: 0,
    };
  }

  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let tempWinStreak = 0;
  let tempLossStreak = 0;

  for (const match of userMatches) {
    if (match.result === "win") {
      tempWinStreak++;
      tempLossStreak = 0;
      if (tempWinStreak > longestWinStreak) longestWinStreak = tempWinStreak;
    } else {
      tempLossStreak++;
      tempWinStreak = 0;
      if (tempLossStreak > longestLossStreak)
        longestLossStreak = tempLossStreak;
    }
  }

  const reversed = [...userMatches].reverse();
  const latestResult = reversed[0].result;
  let currentStreakCount = 0;
  for (const match of reversed) {
    if (match.result === latestResult) {
      currentStreakCount++;
    } else {
      break;
    }
  }

  return {
    currentStreakCount,
    currentStreakType: latestResult,
    longestWinStreak,
    longestLossStreak,
  };
}


interface StreakCardProps {
  name: string;
  sessions: any[];
}

const StreakCard: React.FC<StreakCardProps> = ({ name, sessions }) => {
  const [streak, setStreak] = useState({
    currentStreakCount: 0,
    currentStreakType: "none",
    longestWinStreak: 0,
    longestLossStreak: 0,
  });

  useEffect(() => {
    if (!name || !sessions) return;
    setStreak(computeStreakStats(sessions, name));
  }, [name, sessions]);

  return (
    <>
      {streak.currentStreakType === "none" ? (
        <div className="text-slate-500">No matches found.</div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* Streak Icon + Label */}
          <div className="flex flex-col items-center">
            <span className="text-3xl">
              {streak.currentStreakType === "win" ? "🔥" : "🥶"}
            </span>
            <p className="text-sm mt-1 text-gray-500">
              {streak.currentStreakType === "win"
                ? "Win Streak"
                : "Loss Streak"}
            </p>
            <p
              className={`text-4xl font-bold ${
                streak.currentStreakType === "win"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {streak.currentStreakCount}
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 my-2" />

          {/* Longest Win / Loss */}
          <div className="flex justify-center gap-8 text-xs">
            <div className="flex flex-col items-center">
              <span className="text-gray-500">🏆 Longest Win</span>
              <span className="text-green-600 font-semibold">
                {streak.longestWinStreak}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-500">💔 Longest Loss</span>
              <span className="text-red-500 font-semibold">
                {streak.longestLossStreak}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StreakCard;
