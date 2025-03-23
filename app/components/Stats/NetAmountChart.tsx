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

  // 1) Aggregate net amounts by date
  const dateMap: Record<string, number> = {};

  data.forEach((match) => {
    const dateKey = new Date(match.timestamp).toISOString().slice(0, 10);
    const netAmount = match.receiver === name ? match.amount : -match.amount;

    if (!dateMap[dateKey]) {
      dateMap[dateKey] = 0;
    }
    dateMap[dateKey] += netAmount;
  });

  // 2) Sort by date & accumulate net amounts over time
  const sortedEntries = Object.entries(dateMap)
    .map(([date, net]) => ({ date, net }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cumulative = 0;
  const cumulativeNetData = sortedEntries.map((entry) => {
    cumulative += entry.net;
    return { date: entry.date, cumulative };
  });

  // 3) Determine final net for color-coding
  const finalNet = cumulativeNetData.length > 0 
    ? cumulativeNetData[cumulativeNetData.length - 1].cumulative 
    : 0;
  const strokeColor = finalNet < 0 ? "#f87171" : "#4f46e5";

  // 4) Handle empty data scenario
  if (cumulativeNetData.length === 0) {
    return (
      <div className="w-full p-4 md:p-6 bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm rounded-lg">
        <h2 className="text-lg md:text-xl font-semibold text-slate-700 text-center mb-4">
          Cumulative Net Amount
        </h2>
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm rounded-lg">
      <h2 className="text-lg md:text-xl font-semibold text-slate-700 text-center mb-4">
        Cumulative Net Amount
      </h2>
      <ResponsiveContainer width="100%" height={isMobile ? 140 : 220}>
        <LineChart data={cumulativeNetData}>
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
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0" }}
            labelStyle={{ color: "#475569" }}
          />
          <Line
            type="monotone"
            dataKey="cumulative"
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
