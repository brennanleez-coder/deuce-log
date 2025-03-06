"use client";

import { useUser } from "@/hooks/useUser";
import React, { useState } from "react";
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
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MatchData {
  sessionId: string;
  timestamp: string;
  amount: number;
  payer: string;
  receiver: string;
  team1: string[];
  team2: string[];
}

interface LineChartProps {
  data: MatchData[];
}

const PerformanceCharts: React.FC<LineChartProps> = ({ data }) => {
  const { name } = useUser();
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const [chartType, setChartType] = useState<"netAmount" | "winLoss">(
    "netAmount"
  );

  const dateMap: Record<string, number> = {};
  const winLossMap: Record<string, { wins: number; losses: number }> = {};

  data.forEach((match) => {
    const date = new Date(match.timestamp).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    });

    const netAmount = match.receiver === name ? match.amount : -match.amount;

    if (!dateMap[date]) {
      dateMap[date] = 0;
    }
    dateMap[date] += netAmount;

    // Determine if user was in team1 or team2
    const userInTeam1 = match.team1.includes(name as string);
    const userInTeam2 = match.team2.includes(name as string);

    if (userInTeam1 || userInTeam2) {
      const userWon = match.payer !== match.team1[0]; // If payer is in team1, team2 won
      const isUserWinner =
        (userInTeam1 && userWon) || (userInTeam2 && !userWon);

      if (!winLossMap[date]) {
        winLossMap[date] = { wins: 0, losses: 0 };
      }

      if (isUserWinner) {
        winLossMap[date].wins += 1;
      } else {
        winLossMap[date].losses += 1;
      }
    }
  });

  const aggregatedNetData = Object.entries(dateMap)
    .map(([date, netAmount]) => ({ date, netAmount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cumulativeNet = 0;
  const cumulativeNetData = aggregatedNetData.map((entry) => {
    cumulativeNet += entry.netAmount;
    return { ...entry, cumulativeNet };
  });

  const aggregatedWinLossData = Object.entries(winLossMap)
    .map(([date, { wins, losses }]) => ({ date, wins, losses }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (cumulativeNetData.length === 0) {
    return (
      <div className="w-full p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
          Match Stats Over Time
        </h2>
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-center md:justify-between items-center">
        <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
          Match Stats Over Time
        </h2>
        <div className="flex justify-center mb-4">
          <Select
            value={chartType}
            onValueChange={(value) =>
              setChartType(value as "netAmount" | "winLoss")
            }
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select Chart" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="netAmount">Cumulative Net Amount</SelectItem>
              <SelectItem value="winLoss">Wins & Losses Over Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
        {chartType === "netAmount" ? (
          <LineChart data={cumulativeNetData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="cumulativeNet"
              stroke="#4f46e5"
              strokeWidth={2}
            />
          </LineChart>
        ) : (
          <LineChart data={aggregatedWinLossData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
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
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceCharts;
