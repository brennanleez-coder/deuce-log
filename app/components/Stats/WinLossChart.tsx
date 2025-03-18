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
    const date = new Date(match.timestamp).toISOString().slice(0, 10);

    // Check if user participated
    const userInTeam1 = match.team1.includes(name as string);
    const userInTeam2 = match.team2.includes(name as string);

    if (userInTeam1 || userInTeam2) {
      // Figure out which team won
      // If `payer` is in team1 => team2 won that match (assuming negative for team1)
      // Otherwise, if `payer` is in team2 => team1 won
      const isTeam1Winner = !match.team1.includes(match.payer);
      const userIsOnWinningTeam =
        (userInTeam1 && isTeam1Winner) || (userInTeam2 && !isTeam1Winner);

      if (!winLossMap[date]) {
        winLossMap[date] = { wins: 0, losses: 0 };
      }

      if (userIsOnWinningTeam) {
        winLossMap[date].wins += 1;
      } else {
        winLossMap[date].losses += 1;
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
      <div className="w-full p-4 md:p-6">
        <h2 className="text-lg md:text-xl text-slate-600 font-semibold text-center mb-4">
          Wins & Losses Over Time
        </h2>
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 rounded-md">
      <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
        Wins & Losses Over Time
      </h2>
      <ResponsiveContainer width="100%" height={isMobile ? 130 : 200}>
        <LineChart data={aggregatedWinLossData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
              })
            }
          />
          <YAxis />
          <Tooltip />
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
