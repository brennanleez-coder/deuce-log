"use client";

import React, { useEffect, useState } from "react";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
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

function countSessionsThisWeek(sessions: any[]): number {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

  return sessions.filter((s) => {
    const createdAt =
      typeof s.createdAt === "string"
        ? parseISO(s.createdAt)
        : new Date(s.createdAt);
    return isWithinInterval(createdAt, { start, end });
  }).length;
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
  const [weeklySessions, setWeeklySessions] = useState(0);

  useEffect(() => {
    if (!name || !sessions) return;
    setStreak(computeStreakStats(sessions, name));
    setWeeklySessions(countSessionsThisWeek(sessions));
  }, [name, sessions]);

  return (
    <Card className="flex flex-col gap-y-4">
      <CardHeader className="bg-gray-50 rounded-t-xl px-6 py-4 flex items-center justify-between">
        <CardTitle className="flex w-full items-center gap-3 justify-between text-xl font-bold text-slate-600">
          <h2 className="text-xl font-bold text-slate-600 text-center">
            🏋️‍♂️ Current Performance
          </h2>
          {/* Weekly Sessions */}
          <div className="col-span-full text-sm text-center text-slate-500 mt-2">
            <p>
              📅 Sessions played this week (Mon–Sun):{" "}
              <span className="font-semibold text-slate-700">
                {weeklySessions}
              </span>
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-center text-slate-600">
        {streak.currentStreakType === "none" ? (
          <div className="col-span-full text-slate-500">
            No matches found.
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center border rounded-lg p-4 shadow-sm bg-slate-50">
              <span className="text-lg">
                {streak.currentStreakType === "win" ? "🔥" : "🥶"}
              </span>
              <p className="font-medium">
                {streak.currentStreakType === "win"
                  ? "Win Streak"
                  : "Loss Streak"}
              </p>
              <p
                className={`text-lg font-bold ${
                  streak.currentStreakType === "win"
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {streak.currentStreakCount}
              </p>
            </div>

            <div className="flex flex-col items-center border rounded-lg p-4 shadow-sm bg-slate-50">
              <span className="text-lg">🏆</span>
              <p className="font-medium">Longest Win Streak</p>
              <p className="text-lg font-bold text-green-600">
                {streak.longestWinStreak}
              </p>
            </div>

            <div className="flex flex-col items-center border rounded-lg p-4 shadow-sm bg-slate-50">
              <span className="text-lg">💔</span>
              <p className="font-medium">Longest Loss Streak</p>
              <p className="text-lg font-bold text-red-500">
                {streak.longestLossStreak}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakCard;
