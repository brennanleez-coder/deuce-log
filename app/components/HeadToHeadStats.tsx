"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types/types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface HeadToHeadStatsProps {
  transactions: Transaction[];
  userName: string;
}

interface OpponentRecord {
  totalWins: number;
  totalLosses: number;
  encounters: ("W" | "L")[];
}

export default function HeadToHeadStats({
  transactions,
  userName,
}: HeadToHeadStatsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Create a map of opponentName -> { totalWins, totalLosses, encounters[] }
  const opponentStats: Record<string, OpponentRecord> = {};

  transactions.forEach((t) => {
    const userInTeam1 = t.team1.includes(userName);
    const userInTeam2 = t.team2.includes(userName);

    if (!userInTeam1 && !userInTeam2) return;

    // Determine the winning team
    // If t.team1[0] === t.payer => "team2" is winner, else "team1"
    const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";

    const userIsWinner =
      (userInTeam1 && winningTeam === "team1") ||
      (userInTeam2 && winningTeam === "team2");

    // Opponents array
    const opponents = userInTeam1 ? t.team2 : t.team1;

    opponents.forEach((opponent) => {
      if (!opponentStats[opponent]) {
        opponentStats[opponent] = {
          totalWins: 0,
          totalLosses: 0,
          encounters: [],
        };
      }

      if (userIsWinner) {
        // user won => from the user's perspective: Win => "W"
        opponentStats[opponent].totalWins += 1;
        opponentStats[opponent].encounters.push("W");
      } else {
        // user lost => from the user's perspective: Loss => "L"
        opponentStats[opponent].totalLosses += 1;
        opponentStats[opponent].encounters.push("L");
      }
    });
  });

  // Convert to array
  const statsArray = Object.entries(opponentStats).map(
    ([opponent, record]) => ({
      opponent,
      totalWins: record.totalWins,
      totalLosses: record.totalLosses,
      encounters: record.encounters,
    })
  );

  statsArray.sort((a, b) => a.opponent.localeCompare(b.opponent));

  if (statsArray.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mt-4">
        <h3 className="text-lg font-semibold mb-2">Head-to-Head Stats</h3>
        <p className="text-gray-500">No head-to-head data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Head-to-Head Stats</h3>
        <Button
          variant="outline"
          className="flex items-center gap-1 text-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Hide" : "Show"}
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>
      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="h2h-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <table className="w-full border-collapse mt-4 text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left text-gray-600">Against</th>
                  <th className="p-2 text-left text-gray-600">My W / L</th>
                  <th className="p-2 text-left text-gray-600">Last 5</th>
                </tr>
              </thead>
              <tbody>
                {statsArray.map(
                  ({ opponent, totalWins, totalLosses, encounters }) => {
                    // last 5 results from chronological array
                    const last5 = encounters.slice(-5);

                    return (
                      <tr
                        key={opponent}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-2 font-medium text-gray-800">
                          {opponent}
                        </td>
                        <td className="p-2 text-gray-700">{`${totalWins} / ${totalLosses}`}</td>
                        <td className="p-2 text-gray-700">
                          <div className="flex gap-1">
                            {last5.map((result, i) => {
                              // 'W' => Opponent's Win, 'L' => Opponent's Loss
                              const isWin = result === "W";
                              return (
                                <span
                                  key={i}
                                  className={`px-2 py-1 rounded border text-xs font-bold 
                                ${
                                  isWin
                                    ? "border-green-600 text-green-600"
                                    : "border-red-600 text-red-600"
                                }`}
                                >
                                  {result}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
