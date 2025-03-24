"use client";

import {
  Trophy,
  XCircle,
  CheckCircle,
  Gamepad2,
} from "lucide-react";

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
    <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-sm px-4 py-6 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <MetricCard
          icon={<Gamepad2 className="w-5 h-5 text-primary" />}
          label="Matches"
          value={matchesPlayed}
        />
        <MetricCard
          icon={<CheckCircle className="w-5 h-5 text-success" />}
          label="Wins"
          value={winCount}
          textColor="text-success"
        />
        <MetricCard
          icon={<XCircle className="w-5 h-5 text-destructive" />}
          label="Losses"
          value={lossCount}
          textColor="text-destructive"
        />
        <MetricCard
          icon={
            <Trophy
              className={`w-5 h-5 ${
                netAmount > 0
                  ? "text-success"
                  : netAmount < 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            />
          }
          label="Net"
          value={
            netAmount > 0
              ? `+$${netAmount.toFixed(2)}`
              : netAmount < 0
              ? `-$${Math.abs(netAmount).toFixed(2)}`
              : `$${netAmount.toFixed(2)}`
          }
          textColor={
            netAmount > 0
              ? "text-success"
              : netAmount < 0
              ? "text-destructive"
              : "text-muted-foreground"
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
  textColor = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  textColor?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="bg-muted rounded-full p-2">{icon}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold ${textColor}`}>{value}</div>
    </div>
  );
}
