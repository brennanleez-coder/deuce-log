"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Medal } from "lucide-react";

import { getHeadToHeadStats } from "@/lib/utils";
import HeadToHeadTable from "./HeadToHeadTable";
import { Transaction } from "@prisma/client";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
interface HeadToHeadStatsProps {
  transactions: Transaction[];
  userName: string;
}

export default function HeadToHeadStats({
  transactions,
  userName,
}: HeadToHeadStatsProps) {
  const [isOpen, setIsOpen] = useState(true);

  // --- Calculate stats ---
  const statsArray = getHeadToHeadStats(transactions, userName);

  const { mostDefeatedOpponents, toughestOpponents } = useBadmintonSessionStats(
    transactions,
    userName
  );

  if (statsArray.length === 0) {
    return (
      <div className="bg-white rounded-lg mt-4">
        <p className="text-gray-500">No head-to-head data available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[80vh] overflow-y-auto items-center px-2 bg-white rounded-xl shadow-md p-4 border border-gray-200 w-full">
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="h2h-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Partner Performance */}
            <div className="border-b pb-4 mb-4 flex flex-col items-center">
              <h4 className="text-lg font-semibold text-gray-900 text-center mb-6">
                Opponent Podium 🏆
              </h4>

              {/* Podium Layout */}
              <div className="grid grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
                {/* Toughest Opponents - Rivals */}
                <div className="flex flex-col items-center gap-4">
                  <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Hardest
                  </h5>
                  {toughestOpponents?.map((opponent, index) => (
                    <div
                      key={opponent.name}
                      className="flex flex-col items-center"
                    >
                      <Medal className="w-6 h-6 text-blue-500 mb-1" />
                      <p className="text-md font-semibold">{opponent.name}</p>
                      <p className="text-sm text-gray-600">
                        Wins: {opponent.wins} | Losses: {opponent.losses}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Most Beaten Opponents */}
                <div className="flex flex-col items-center gap-4">
                  <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Easiest
                  </h5>
                  {mostDefeatedOpponents?.map((opponent, index) => (
                    <div
                      key={opponent.name}
                      className="flex flex-col items-center"
                    >
                      <Medal className="w-6 h-6 text-gray-600 mb-1" />
                      <p className="text-md font-semibold">{opponent.name}</p>
                      <p className="text-sm text-gray-600">
                        Wins: {opponent.wins} | Losses: {opponent.losses}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Head-to-Head Table */}
            <HeadToHeadTable statsArray={statsArray} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
