"use client";

import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import SessionManagement from "../components/Sessions/SessionManagement";
import withAuth from "@/hooks/hoc/withAuth";
import { useState, useEffect, useRef } from "react";
import AllTimeStats from "@/app/components/Stats/AllTimeStats";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";
import { useUser } from "@/hooks/useUser";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";

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
  console.log(sessions);

  const { winCount, lossCount } = useBadmintonSessionStats(
    sessions.flatMap((s) => s.transactions ?? []),
    name
  );

  const winLossPieData = useMemo(() => {
    if (winCount === 0 && lossCount === 0) {
      return [];
    }
    return [
      { name: "Wins", value: winCount },
      { name: "Losses", value: lossCount },
    ];
  }, [winCount, lossCount]);

  const partnerPieData = useMemo(() => {
    // Map to count # of times the user teams up with each partner
    const partnerCount: Record<string, number> = {};
    if (sessions.transactions === 0) {
      return [];
    }
    sessions
      .flatMap((s) => s.transactions ?? [])
      .forEach((match) => {
        const userInTeam1 = match.team1.includes(name as string);
        const userInTeam2 = match.team2.includes(name as string);

        if (userInTeam1) {
          // Everyone in team1 except the user is a partner
          match.team1.forEach((member) => {
            if (member !== name) {
              partnerCount[member] = (partnerCount[member] || 0) + 1;
            }
          });
        } else if (userInTeam2) {
          // Everyone in team2 except the user is a partner
          match.team2.forEach((member) => {
            if (member !== name) {
              partnerCount[member] = (partnerCount[member] || 0) + 1;
            }
          });
        }
      });

    // Convert the map into an array suitable for Pie
    return Object.entries(partnerCount).map(([partner, count]) => ({
      name: partner,
      value: count,
    }));
  }, [sessions, name]);

  return (
    <main className="min-h-screen text-gray-900 p-4 font-sans pt-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col flex-1 gap-y-6">
            {sessions && (
              <AllTimeStats
                userName={name}
                totalSessionFees={aggregateSessionFees}
                transactions={sessions.flatMap((s) => s.transactions ?? [])}
                loading={isLoading}
              />
            )}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1) Win/Loss Pie */}
              <div className="w-full p-4 md:p-6 border rounded-md">
                <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
                  Overall Win/Loss
                </h2>
                {winLossPieData.length === 0 ? (
                  <p className="text-center text-gray-500">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        nameKey="name"
                        data={winLossPieData}
                        label
                        outerRadius={80}
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
                )}
              </div>

              {/* 2) Partner Distribution Pie */}
              <div className="w-full p-4 md:p-6 border rounded-md">
                <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
                  Partner Distribution
                </h2>
                {partnerPieData.length === 0 ? (
                  <p className="text-center text-gray-500">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        nameKey="name"
                        data={partnerPieData}
                        label
                        outerRadius={80}
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default withAuth(Home);
