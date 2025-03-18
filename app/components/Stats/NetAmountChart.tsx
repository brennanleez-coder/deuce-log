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

interface NetAmountChartProps {
  data: MatchData[];
}

const NetAmountChart: React.FC<NetAmountChartProps> = ({ data }) => {
  const { name } = useUser();
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });

  // Aggregate net amounts by date
  const dateMap: Record<string, number> = {};

  data.forEach((match) => {
    const date = new Date(match.timestamp).toISOString().slice(0, 10);
    const netAmount = match.receiver === name ? match.amount : -match.amount;

    if (!dateMap[date]) {
      dateMap[date] = 0;
    }
    dateMap[date] += netAmount;
  });

  // Sort by date, then accumulate net amounts over time
  const aggregatedNetData = Object.entries(dateMap)
    .map(([date, netAmount]) => ({ date, netAmount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cumulativeNet = 0;
  const cumulativeNetData = aggregatedNetData.map((entry) => {
    cumulativeNet += entry.netAmount;
    return { ...entry, cumulativeNet };
  });

  // Determine stroke color based on final cumulative net amount
  const finalNet =
    cumulativeNetData.length > 0
      ? cumulativeNetData[cumulativeNetData.length - 1].cumulativeNet
      : 0;
  const strokeColor = finalNet < 0 ? "#f87171" : "#4f46e5";

  // Handle empty data scenario
  if (cumulativeNetData.length === 0) {
    return (
      <div className="w-full p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
          Cumulative Net Amount
        </h2>
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 rounded-md">
      <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
        Cumulative Net Amount
      </h2>
      <ResponsiveContainer width="100%" height={isMobile ? 130 : 200}>
        <LineChart data={cumulativeNetData}>
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
            dataKey="cumulativeNet"
            stroke={strokeColor}
            strokeWidth={2}
            name="Net Amount"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetAmountChart;
