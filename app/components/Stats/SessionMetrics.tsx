"use client";

import { Trophy, XCircle, CheckCircle, Gamepad2 } from "lucide-react";

interface SessionMetricsProps {
  matchesPlayed: number;
  winCount: number;
  lossCount: number;
  netAmount: number;
}

export default function SessionMetrics({
  matchesPlayed,
  winCount,
  lossCount,
  netAmount,
}: SessionMetricsProps) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {/* Matches Played */}
        <MetricCard icon={<Gamepad2 className="w-6 h-6 text-blue-500" />} label="Matches" value={matchesPlayed} />

        {/* Wins */}
        <MetricCard icon={<CheckCircle className="w-6 h-6 text-green-500" />} label="Wins" value={winCount} textColor="text-green-700" />

        {/* Losses */}
        <MetricCard icon={<XCircle className="w-6 h-6 text-red-500" />} label="Losses" value={lossCount} textColor="text-red-700" />

        {/* Net Amount */}
        <MetricCard
          icon={
            <Trophy
              className={`w-6 h-6 ${
                netAmount > 0 ? "text-green-500" : netAmount < 0 ? "text-red-500" : "text-gray-500"
              }`}
            />
          }
          label="Net"
          value={
            netAmount > 0
              ? `+ $${netAmount.toFixed(2)}`
              : netAmount < 0
              ? `- $${Math.abs(netAmount).toFixed(2)}`
              : `$${netAmount.toFixed(2)}`
          }
          textColor={
            netAmount > 0 ? "text-green-700" : netAmount < 0 ? "text-red-700" : "text-gray-800"
          }
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  textColor = "text-gray-900",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  textColor?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {icon}
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-semibold ${textColor}`}>{value}</p>
    </div>
  );
}
