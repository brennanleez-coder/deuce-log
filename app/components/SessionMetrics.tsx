"use client";

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
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-600">Matches</p>
          <p className="text-xl font-bold text-gray-800">{matchesPlayed}</p>
        </div>
        <div>
          <p className="text-sm text-green-600">Wins</p>
          <p className="text-xl font-bold text-green-700">{winCount}</p>
        </div>
        <div>
          <p className="text-sm text-red-600">Losses</p>
          <p className="text-xl font-bold text-red-700">{lossCount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Net</p>
          <p
            className={`text-xl font-bold ${
              netAmount > 0 ? "text-green-700" : netAmount < 0 ? "text-red-700" : "text-gray-800"
            }`}
          >
            {netAmount > 0
              ? `+ $${netAmount}`
              : netAmount < 0
              ? `- $${Math.abs(netAmount)}`
              : `$${netAmount}`}
          </p>
        </div>
      </div>
    </div>
  );
}
