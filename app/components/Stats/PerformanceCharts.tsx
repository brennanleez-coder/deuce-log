"use client";

import React from "react";
import NetAmountChart from "./NetAmountChart";
import WinLossChart from "./WinLossChart";

interface MatchData {
  sessionId: string;
  timestamp: string;
  amount: number;
  payer: string;
  receiver: string;
  team1: string[];
  team2: string[];
}

interface PerformanceChartsProps {
  data: MatchData[];
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ data }) => {
  return (
    <div className="w-full p-4 md:p-6">
      {/* Overall title */}
      <h2 className="text-lg md:text-xl font-semibold text-center mb-4">
        Match Stats Over Time
      </h2>

      {/* Two charts in a responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NetAmountChart data={data} />
        <WinLossChart data={data} />
      </div>
    </div>
  );
};

export default PerformanceCharts;
