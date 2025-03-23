"use client";

import React, { useEffect, useState } from "react";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { isWithinInterval, startOfWeek, endOfWeek, parseISO } from "date-fns";
import StreakCard from "./StreakCard";
import ConsistencyCard from "./ConsistencyCard";
import NewPartnersCard from "./NewPartnersCard";
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


interface CurrentPerformanceProps {
  name: string;
  sessions: any[];
}

const CurrentPerformance: React.FC<CurrentPerformanceProps> = ({ name, sessions }) => {
  const [streak, setStreak] = useState({
    currentStreakCount: 0,
    currentStreakType: "none",
    longestWinStreak: 0,
    longestLossStreak: 0,
  });
  const [weeklySessions, setWeeklySessions] = useState(0);

  useEffect(() => {
    if (!name || !sessions) return;
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
          {/* <div className="col-span-full text-sm text-center text-slate-500 mt-2">
            <p>
              📅 Sessions played this week (Mon–Sun):{" "}
              <span className="font-semibold text-slate-700">
                {weeklySessions}
              </span>
            </p>
          </div> */}
        </CardTitle>
      </CardHeader>

      <CardContent className="text-sm text-center text-slate-600 grid grid-cols-1 md:grid-cols-3 gap-y-2">
        <StreakCard name={name} sessions={sessions} />
        <ConsistencyCard sessions={sessions} />
        <NewPartnersCard transactions={sessions.flatMap(s=>s.transactions)} userName={name} />
      </CardContent>
    </Card>
  );
};

export default CurrentPerformance;
