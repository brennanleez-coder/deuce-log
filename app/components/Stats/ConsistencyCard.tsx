"use client";
import React, { useEffect, useState } from "react";
import { subDays, isAfter, parseISO } from "date-fns";
import { BadmintonSession } from "@prisma/client";

/**
 * Returns an object with:
 *  - pastWeekCount   (# sessions in the last 7 days)
 *  - wowDelta        (% change vs the previous 7 days)
 *  - pastMonthCount  (# sessions in the last 30 days)
 *  - momDelta        (% change vs the previous 30 days)
 */
export function computeConsistencyStats(sessions: any[]): {
  pastWeekCount: number;
  wowDelta: number;
  pastMonthCount: number;
  momDelta: number;
} {
  const now = new Date();

  // 1) Count sessions in the last 7 days
  const weekStart = subDays(now, 7);
  const pastWeekSessions = sessions.filter((s: any) => {
    const dt = typeof s.createdAt === "string" ? parseISO(s.createdAt) : s.createdAt;
    return isAfter(dt, weekStart);
  }).length;

  // 2) Count sessions in the previous 7 days (8-14 days ago)
  const prevWeekStart = subDays(now, 14);
  const prevWeekEnd = subDays(now, 7);
  const previousWeekSessions = sessions.filter((s: any) => {
    const dt = typeof s.createdAt === "string" ? parseISO(s.createdAt) : s.createdAt;
    return isAfter(dt, prevWeekStart) && !isAfter(dt, prevWeekEnd);
  }).length;

  // 3) Calculate WoW delta as a percentage
  const wowDelta =
    previousWeekSessions === 0
      ? 0
      : ((pastWeekSessions - previousWeekSessions) / previousWeekSessions) * 100;

  // 4) Count sessions in the last 30 days
  const monthStart = subDays(now, 30);
  const pastMonthSessions = sessions.filter((s: any) => {
    const dt = typeof s.createdAt === "string" ? parseISO(s.createdAt) : s.createdAt;
    return isAfter(dt, monthStart);
  }).length;

  // 5) Count sessions in the previous 30 days
  const prevMonthStart = subDays(now, 60);
  const prevMonthEnd = subDays(now, 30);
  const previousMonthSessions = sessions.filter((s: any) => {
    const dt = typeof s.createdAt === "string" ? parseISO(s.createdAt) : s.createdAt;
    return isAfter(dt, prevMonthStart) && !isAfter(dt, prevMonthEnd);
  }).length;

  // 6) Calculate MoM delta as a percentage
  const momDelta =
    previousMonthSessions === 0
      ? 0
      : ((pastMonthSessions - previousMonthSessions) / previousMonthSessions) * 100;

  return {
    pastWeekCount: pastWeekSessions,
    wowDelta,
    pastMonthCount: pastMonthSessions,
    momDelta,
  };
}

interface ConsistencyCardProps {
  sessions: BadmintonSession[];
}

const ConsistencyCard: React.FC<ConsistencyCardProps> = ({ sessions }) => {
  const [consistency, setConsistency] = useState({
    pastWeekCount: 0,
    wowDelta: 0,
    pastMonthCount: 0,
    momDelta: 0,
  });

  useEffect(() => {
    if (!sessions) return;
    setConsistency(computeConsistencyStats(sessions));
  }, [sessions]);

  // Early return if no data
  if (!sessions || sessions.length === 0) {
    return <div className="text-slate-500 text-sm">No session data found.</div>;
  }

  // Check improvement or not for coloring
  const isMonthImproved = consistency.momDelta > 0;
  const momPercent = `${consistency.momDelta.toFixed(1)}%`;
  // Choose an icon based on improvement
  const momIcon = isMonthImproved ? "📈" : "📉";

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Tilted container to mimic StreakCard layout */}
      <div className="relative bg-white border border-gray-200 rounded-md p-4 shadow-sm transform rotate-1 hover:rotate-0 transition-transform duration-300">
        {/* Floating badge for 7-day count */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 p-3 rounded-full shadow-md bg-white border border-gray-100 flex flex-col items-center w-24">
          <span className="text-2xl">📅</span>
          <p className="text-xs text-gray-500">7-Day</p>
          <p className="text-xl font-bold text-gray-700">
            {consistency.pastWeekCount}
          </p>
        </div>

        {/* Two boxes side-by-side below the floating badge */}
        <div className="pt-10 flex items-center justify-around gap-3">
          {/* Past 30 Days box */}
          <div className="bg-gray-50 w-full p-2 rounded-md shadow text-center">
            <p className="text-sm text-gray-400 mb-1">Past 30 Days</p>
            <div className="flex flex-col items-center">
              <span className="text-xl">📆</span>
              <span className="text-gray-700 text-lg font-semibold">
                {consistency.pastMonthCount}
              </span>
            </div>
          </div>

          {/* MoM change box */}
          <div className="bg-gray-50 w-full p-2 rounded-md shadow text-center">
            <p className="text-sm text-gray-400 mb-1">MoM Change</p>
            <div className="flex flex-col items-center">
              <span className="text-xl">{momIcon}</span>
              <span
                className={`text-lg font-semibold ${
                  isMonthImproved ? "text-green-600" : "text-red-500"
                }`}
              >
                {momPercent}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsistencyCard;
