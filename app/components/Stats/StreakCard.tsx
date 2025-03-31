"use client";

import React, { useEffect, useState } from "react";
import { isWithinInterval, startOfWeek, endOfWeek, parseISO } from "date-fns";

function computeStreakStats(sessions: any[], userName: string) {
  const allTransactions = sessions.flatMap((s) => s.transactions || []);
  const userMatches = allTransactions
    .map((tx) => ({
      // Update result logic to match your real "win" vs. "loss" checks
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

  // Calculate longest streaks
  for (const match of userMatches) {
    if (match.result === "win") {
      tempWinStreak++;
      tempLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
    } else {
      tempLossStreak++;
      tempWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, tempLossStreak);
    }
  }

  // Find current streak (going backwards)
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

  // If no matches found
  if (streak.currentStreakType === "none") {
    return <div className="text-slate-500 text-sm">No matches found.</div>;
  }

  // Determine icon/colors for the current streak
  const isWinStreak = streak.currentStreakType === "win";
  const streakIcon = isWinStreak ? "🔥" : "🥶";
  const streakLabel = isWinStreak ? "Win Streak" : "Loss Streak";
  const streakColor = isWinStreak ? "text-green-600" : "text-red-500";

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Outer container with slight rotation for a unique look */}
      <div className="relative bg-white border border-gray-200 rounded-md p-4 shadow-sm transform rotate-1 hover:rotate-0 transition-transform duration-300">
        {/* Current Streak at the top, "popping out" of the card */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 p-3 rounded-full shadow-md bg-white border border-gray-100 flex flex-col items-center w-24">
          <span className="text-2xl">{streakIcon}</span>
          <p className="text-xs text-gray-500">{streakLabel}</p>
          <p className={`text-xl font-bold ${streakColor}`}>
            {streak.currentStreakCount}
          </p>
        </div>

        {/* Content below the pop-out */}
        <div className="pt-10 flex items-center justify-around gap-3">
          {/* Longest Win */}
          <div className="bg-gray-50 w-full p-2 rounded-md shadow text-center">
            <p className="text-sm text-gray-400 mb-1">Longest Win</p>
            <div className="flex flex-col items-center">
              <span className="text-xl">🏆</span>
              <span className="text-green-600 text-lg font-semibold">
                {streak.longestWinStreak}
              </span>
            </div>
          </div>

          {/* Longest Loss */}
          <div className="bg-gray-50 w-full p-2 rounded-md shadow text-center">
            <p className="text-sm text-gray-400 mb-1">Longest Loss</p>
            <div className="flex flex-col items-center">
              <span className="text-xl">💔</span>
              <span className="text-red-500 text-lg font-semibold">
                {streak.longestLossStreak}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
