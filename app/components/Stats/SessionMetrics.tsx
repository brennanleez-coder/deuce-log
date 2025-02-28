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
    <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {/* Matches Played */}
        <div className="flex flex-col items-center">
          <Gamepad2 className="w-6 h-6 text-blue-500" />
          <p className="text-sm text-gray-600 mt-1">Matches</p>
          <p className="text-2xl font-semibold text-gray-900">{matchesPlayed}</p>
        </div>

        {/* Wins */}
        <div className="flex flex-col items-center">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <p className="text-sm text-green-600 mt-1">Wins</p>
          <p className="text-2xl font-semibold text-green-700">{winCount}</p>
        </div>

        {/* Losses */}
        <div className="flex flex-col items-center">
          <XCircle className="w-6 h-6 text-red-500" />
          <p className="text-sm text-red-600 mt-1">Losses</p>
          <p className="text-2xl font-semibold text-red-700">{lossCount}</p>
        </div>

        {/* Net Amount */}
        <div className="flex flex-col items-center">
          <Trophy
            className={`w-6 h-6 ${
              netAmount > 0 ? "text-green-500" : netAmount < 0 ? "text-red-500" : "text-gray-500"
            }`}
          />
          <p className="text-sm text-gray-600 mt-1">Net</p>
          <p
            className={`text-2xl font-semibold ${
              netAmount > 0 ? "text-green-700" : netAmount < 0 ? "text-red-700" : "text-gray-800"
            }`}
          >
            {netAmount > 0
              ? `+ $${netAmount.toFixed(2)}`
              : netAmount < 0
              ? `- $${Math.abs(netAmount).toFixed(2)}`
              : `$${netAmount.toFixed(2)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
