"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types/types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Medal } from "lucide-react";
import { getHeadToHeadStats, getBestAndWorstPartners } from "@/lib/utils";

interface HeadToHeadStatsProps {
  transactions: Transaction[];
  userName: string;
}

export default function HeadToHeadStats({
  transactions,
  userName,
}: HeadToHeadStatsProps) {
  const [isOpen, setIsOpen] = useState(true);

  // --- Use helper functions to calculate stats ---
  const statsArray = getHeadToHeadStats(transactions, userName);
  const { bestPartners, worstPartners } = getBestAndWorstPartners(
    transactions,
    userName
  );
  console.log(transactions)

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
            {/* Partner Performance - Clear Ranking */}
            <div className="border-b pb-4 mb-4 flex flex-col items-center">
              <h4 className="text-md font-semibold text-gray-700 mb-3 text-center">
                Partner Performance
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
                {/* Best Partners Section */}
                <div className="flex flex-col items-center">
                  <p className="text-sm text-green-600 font-medium mb-2">
                    Best Partners
                  </p>

                  {bestPartners.map((p, index) => (
                    <div
                      key={p.name}
                      className={`w-48 p-4 border rounded-lg shadow-sm text-green-700 flex flex-col items-center ${
                        index === 0 ? "bg-green-200" : "bg-green-50"
                      }`}
                    >
                      <Medal
                        className={`w-6 h-6 ${
                          index === 0 ? "text-yellow-500" : "text-green-500"
                        } mb-1`}
                      />
                      <p
                        className={`text-sm font-semibold ${
                          index === 0 ? "text-lg font-bold" : ""
                        }`}
                      >
                        {index === 0 ? `🥇 ${p.name}` : `🥈 ${p.name}`}
                      </p>
                      <p className="text-md font-medium">
                        {p.wins}W / {p.losses}L
                      </p>
                    </div>
                  ))}
                </div>

                {/* Worst Partners Section */}
                <div className="flex flex-col items-center">
                  <p className="text-sm text-red-600 font-medium mb-2">
                    Worst Partners
                  </p>

                  {worstPartners.map((p, index) => (
                    <div
                      key={p.name}
                      className={`w-48 p-4 border rounded-lg shadow-sm text-red-700 flex flex-col items-center ${
                        index === 0 ? "bg-red-200" : "bg-red-50"
                      }`}
                    >
                      <Medal
                        className={`w-6 h-6 ${
                          index === 0 ? "text-yellow-500" : "text-red-500"
                        } mb-1`}
                      />
                      <p
                        className={`text-sm font-semibold ${
                          index === 0 ? "text-lg font-bold" : ""
                        }`}
                      >
                        {index === 0 ? `🥇 ${p.name}` : `🥈 ${p.name}`}
                      </p>
                      <p className="text-md font-medium">
                        {p.wins}W / {p.losses}L
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Head-to-Head Table */}
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
