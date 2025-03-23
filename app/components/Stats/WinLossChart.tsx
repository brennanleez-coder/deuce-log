"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMediaQuery } from "react-responsive";
import { useUser } from "@/hooks/useUser";

interface MatchData {
  sessionId: string;
  timestamp: string;
  amount: number;
  payer: string;
  receiver: string;
  team1: string[];
  team2: string[];
}

interface WinLossChartProps {
  data: MatchData[];
}

const WinLossChart: React.FC<WinLossChartProps> = ({ data }) => {
  const { name } = useUser();
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });

  // Aggregate wins/losses by date
  const winLossMap: Record<string, { wins: number; losses: number }> = {};

  data.forEach((match) => {
    const dateKey = new Date(match.timestamp).toISOString().slice(0, 10);

    // Check if the user participated
    const userInTeam1 = match.team1.includes(name as string);
    const userInTeam2 = match.team2.includes(name as string);

    if (userInTeam1 || userInTeam2) {
      // Determine which team won
      // If `payer` is in team1 => team2 won the match
      // Otherwise, if `payer` is in team2 => team1 won
      const team1Winner = !match.team1.includes(match.payer);
      const userIsOnWinningTeam =
        (userInTeam1 && team1Winner) || (userInTeam2 && !team1Winner);

      if (!winLossMap[dateKey]) {
        winLossMap[dateKey] = { wins: 0, losses: 0 };
      }

      if (userIsOnWinningTeam) {
        winLossMap[dateKey].wins += 1;
      } else {
        winLossMap[dateKey].losses += 1;
      }
    }
  });

  // Sort by date
  const aggregatedWinLossData = Object.entries(winLossMap)
    .map(([date, { wins, losses }]) => ({ date, wins, losses }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Handle empty data scenario
  if (aggregatedWinLossData.length === 0) {
    return (
      <div className="w-full p-4 md:p-6 bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm rounded-lg">
        <h2 className="text-lg md:text-xl font-semibold text-slate-700 text-center mb-4">
          Wins &amp; Losses Over Time
        </h2>
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm rounded-lg">
      <h2 className="text-lg md:text-xl font-semibold text-slate-700 text-center mb-4">
        Wins &amp; Losses Over Time
      </h2>

      <ResponsiveContainer width="100%" height={isMobile ? 140 : 220}>
        <LineChart data={aggregatedWinLossData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tickFormatter={(dateStr) =>
              new Date(dateStr).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
              })
            }
            stroke="#475569"
          />
          <YAxis stroke="#475569" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
            }}
            labelStyle={{ color: "#475569" }}
          />
          <Line
            type="monotone"
            dataKey="wins"
            stroke="#16a34a"
            strokeWidth={2}
            name="Wins"
          />
          <Line
            type="monotone"
            dataKey="losses"
            stroke="#dc2626"
            strokeWidth={2}
            name="Losses"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WinLossChart;
