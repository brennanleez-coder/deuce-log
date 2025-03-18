"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import SessionManagement from "../components/Sessions/SessionManagement";
import withAuth from "@/hooks/hoc/withAuth";
import AllTimeStats from "@/app/components/Stats/AllTimeStats";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";
import { useUser } from "@/hooks/useUser";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
import Loader from "@/components/FullScreenLoader";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

function Home() {
  const { name } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const { sessions, isLoading, createSession, editSession, deleteSession } =
    useBadmintonSessions();

  const aggregateSessionFees = sessions.reduce(
    (acc, session) => acc + session.courtFee,
    0
  );

  const { winCount, lossCount } = useBadmintonSessionStats(
    sessions.flatMap((s) => s.transactions ?? []),
    name
  );

  const winLossPieData = useMemo(() => {
    if (!sessions.length || (winCount === 0 && lossCount === 0)) {
      return [];
    }
    return [
      { name: "Wins", value: winCount },
      { name: "Losses", value: lossCount },
    ];
  }, [winCount, lossCount, sessions]);

  const partnerPieData = useMemo(() => {
    if (!sessions.length) return [];

    const partnerCount: Record<string, number> = {};

    sessions
      .flatMap((s) => s.transactions ?? [])
      .forEach((match) => {
        const userInTeam1 = match.team1.includes(name as string);
        const userInTeam2 = match.team2.includes(name as string);

        if (userInTeam1) {
          match.team1.forEach((member) => {
            if (member !== name) {
              partnerCount[member] = (partnerCount[member] || 0) + 1;
            }
          });
        } else if (userInTeam2) {
          match.team2.forEach((member) => {
            if (member !== name) {
              partnerCount[member] = (partnerCount[member] || 0) + 1;
            }
          });
        }
      });

    // Split into "above threshold" vs. "others"
    const threshold = 5; // More than 5 => individual slice
    const aboveThreshold: { name: string; value: number }[] = [];
    let othersSum = 0;
    const othersDetails: { name: string; value: number }[] = [];

    Object.entries(partnerCount).forEach(([partner, count]) => {
      if (count > threshold) {
        aboveThreshold.push({ name: partner, value: count });
      } else {
        othersSum += count;
        othersDetails.push({ name: partner, value: count });
      }
    });

    // Build final array
    const finalData = [...aboveThreshold];
    if (othersSum > 0) {
      finalData.push({
        name: "Others",
        value: othersSum,
        isOthers: true,
        details: othersDetails.map(p => `${p.partner} - ${p.count}`).join(", "),
      });
    }

    return finalData;
  }, [sessions, name]);

  return (
    <main className="min-h-screen text-gray-900 p-4 font-sans pt-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col flex-1 gap-y-6">
            <Card className="bg-white border border-gray-200 shadow-md rounded-xl p-4">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 text-center">
                  All-Time Stats
                </CardTitle>
              </CardHeader>
              {sessions && (
                <AllTimeStats
                  userName={name}
                  totalSessionFees={aggregateSessionFees}
                  transactions={sessions.flatMap((s) => s.transactions ?? [])}
                  loading={isLoading}
                />
              )}

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full p-4 md:p-6 rounded-md">
                  <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
                    Overall Win/Loss
                  </h2>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-6">
                      <Loader />
                    </div>
                  ) : winLossPieData.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No data available
                    </p>
                  ) : (
                    <div className="w-full h-64 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart
                          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                          <Pie
                            dataKey="value"
                            nameKey="name"
                            data={winLossPieData}
                            label
                            outerRadius="60%"
                          >
                            {winLossPieData.map((entry, index) => {
                              // Define the colors you'd like to cycle through
                              const COLORS = ["#8884d8", "#82ca9d"];
                              return (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              );
                            })}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="w-full p-4 md:p-6 rounded-md">
                  <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
                    Partner Distribution
                  </h2>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-6">
                      <Loader />
                    </div>
                  ) : partnerPieData.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No data available
                    </p>
                  ) : (
                    <div className="w-full h-64 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart
                          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                          <Pie
                            dataKey="value"
                            nameKey="name"
                            data={partnerPieData}
                            label
                            outerRadius="60%"
                          >
                            {partnerPieData.map((entry, index) => {
                              // Use a bigger palette if you have more potential slices
                              const COLORS = [
                                "#0088FE",
                                "#00C49F",
                                "#FFBB28",
                                "#FF8042",
                                "#A28AE5",
                                "#FF5FAA",
                              ];
                              return (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              );
                            })}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export default withAuth(Home);
