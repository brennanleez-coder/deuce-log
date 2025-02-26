"use client";

import React from "react";
import { Transaction } from "@/types/types";

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
    <table className="w-full border-collapse mt-4 text-sm">
      <thead>
        <tr className="border-b">
          <th className="p-2 text-left text-gray-600">Against</th>
          <th className="p-2 text-left text-gray-600">My W / L</th>
          <th className="p-2 text-left text-gray-600">Last 3</th>
        </tr>
      </thead>
      <tbody>
        {statsArray.map(({ opponent, totalWins, totalLosses, encounters }) => {
          const last3 = encounters.slice(showLastX); // Last 3 match results

          return (
            <tr
              key={opponent}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-2 font-medium text-gray-800">{opponent}</td>
              <td className="p-2 text-gray-700">{`${totalWins}W / ${totalLosses}L`}</td>
              <td className="p-2 text-gray-700">
                <div className="flex gap-1">
                  {last3.map((result, i) => (
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
  );
}
