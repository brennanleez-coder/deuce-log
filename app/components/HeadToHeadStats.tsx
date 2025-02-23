"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types/types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getHeadToHeadStats } from "@/lib/utils"; // adjust import path

interface HeadToHeadStatsProps {
  transactions: Transaction[];
  userName: string;
}

export default function HeadToHeadStats({
  transactions,
  userName,
}: HeadToHeadStatsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // --- Use the reusable function here ---
  const statsArray = getHeadToHeadStats(transactions, userName);

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
            <Button
              variant="outline"
              className="flex items-center gap-1 text-sm"
              onClick={() => window.location.reload()}
            >
              Refresh Stats
            </Button>
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
                    // last 5 results
                    const last5 = encounters.slice(-5);

                    return (
                      <tr
                        key={opponent}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-2 font-medium text-gray-800">
                          {opponent}
                        </td>
                        <td className="p-2 text-gray-700">
                          {`${totalWins} / ${totalLosses}`}
                        </td>
                        <td className="p-2 text-gray-700">
                          <div className="flex gap-1">
                            {last5.map((result, i) => {
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
