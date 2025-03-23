
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
  const prevWeekStart = subDays(now, 14); // 14 days ago
  const prevWeekEnd = subDays(now, 7);    // 7 days ago
  const previousWeekSessions = sessions.filter((s: any) => {
    const dt = typeof s.createdAt === "string" ? parseISO(s.createdAt) : s.createdAt;
    return isAfter(dt, prevWeekStart) && !isAfter(dt, prevWeekEnd);
  }).length;

  // 3) Calculate WoW delta as a percentage
  const wowDelta =
    previousWeekSessions === 0
      ? 0 // If there's no previous data, we do 0 or 100% – your call
      : ((pastWeekSessions - previousWeekSessions) / previousWeekSessions) * 100;

  // 4) Count sessions in the last 30 days
  const monthStart = subDays(now, 30);
  const pastMonthSessions = sessions.filter((s: any) => {
    const dt = typeof s.createdAt === "string" ? parseISO(s.createdAt) : s.createdAt;
    return isAfter(dt, monthStart);
  }).length;

  // 5) Count sessions in the previous 30 days
  const prevMonthStart = subDays(now, 60);  // 60 days ago
  const prevMonthEnd = subDays(now, 30);    // 30 days ago
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
      wowDelta: 0,      // still calculated if you want it in the future
      pastMonthCount: 0,
      momDelta: 0,
    });
  
    useEffect(() => {
      if (!sessions) return;
      setConsistency(computeConsistencyStats(sessions));
    }, [sessions]);
  
    if (!sessions || sessions.length === 0) {
      return <div className="text-slate-500">No session data found.</div>;
    }
  
    const isMonthImproved = consistency.momDelta > 0;
    const momPercent = `${consistency.momDelta.toFixed(1)}%`;
  
    return (
      <div className="flex flex-col items-center gap-4">
        
        <div className="flex flex-col items-center">
          <span className="text-3xl">📅</span>
          <p className="text-sm mt-1 text-gray-500">Sessions in Past 7 Days</p>
          <p className="text-4xl font-bold text-gray-700">
            {consistency.pastWeekCount}
          </p>
        </div>
  
        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-2" />
  
        {/* BOTTOM: 2 columns */}
        <div className="flex justify-center gap-8 text-xs">
          {/* Past 30 Days */}
          <div className="flex flex-col items-center">
            <span className="text-gray-500">Past 30 Days</span>
            <span className="text-lg font-bold text-gray-700">
              {consistency.pastMonthCount}
            </span>
          </div>
  
          {/* Month Over Month */}
          <div className="flex flex-col items-center">
            <span className="text-gray-500">Month Over Month</span>
            <span
              className={`text-lg font-bold ${
                isMonthImproved ? "text-green-600" : "text-red-500"
              }`}
            >
              {momPercent}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConsistencyCard;