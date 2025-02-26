"use client";

import React from "react";

interface HeadToHeadTableProps {
  statsArray: {
    opponent: string;
    totalWins: number;
    totalLosses: number;
    encounters: string[];
  }[];
  showLastX?: number;
}

export default function HeadToHeadTable({ statsArray, showLastX = 3 }: HeadToHeadTableProps) {
  if (statsArray.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse mt-4 text-sm text-center">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-3 text-gray-700">Against</th>
            <th className="p-3 text-gray-700">My W / L</th>
            <th className="p-3 text-gray-700">Last {showLastX}</th>
          </tr>
        </thead>
        <tbody>
          {statsArray.map(({ opponent, totalWins, totalLosses, encounters }) => {
            const lastX = encounters.slice(-showLastX); // Get last X match results

            return (
              <tr
                key={opponent}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 font-medium text-gray-800">{opponent}</td>
                <td className="p-3 text-gray-700">{`${totalWins}W / ${totalLosses}L`}</td>
                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    {lastX.map((result, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded border text-xs font-bold 
                          ${
                            result === "W"
                              ? "border-green-600 text-green-600"
                              : "border-red-600 text-red-600"
                          }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
