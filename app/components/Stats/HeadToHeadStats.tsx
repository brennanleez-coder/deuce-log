"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Medal } from "lucide-react";
import { getHeadToHeadStats, getBestAndWorstPartners } from "@/lib/utils";
import HeadToHeadTable from "./HeadToHeadTable";
import { Transaction } from "@/types/types";

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
  const { bestPartners, worstPartners } = getBestAndWorstPartners(
    transactions,
    userName
  );

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
            {/* Partner Performance */}
            <div className="border-b pb-4 mb-4 flex flex-col items-center">
              <h4 className="text-md font-semibold text-gray-700 mb-3 text-center">
                Partner Performance
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
                {/* Best Partner */}
                {bestPartners?.length > 0 && (
                  <div className="flex flex-col items-center text-center border rounded-lg p-4 shadow-sm w-full">
                    <Medal className="w-6 h-6 text-yellow-500 mb-2" />
                    <p className="text-md font-semibold text-gray-800">{bestPartners[0]?.name || "N/A"}</p>
                    <p className="text-sm text-gray-500">Best Partner</p>
                    <p className="text-md font-medium text-gray-700">
                      {bestPartners[0]?.wins}W / {bestPartners[0]?.losses}L
                    </p>
                  </div>
                )}

                {/* Worst Partner */}
                {worstPartners?.length > 0 && (
                  <div className="flex flex-col items-center text-center border rounded-lg p-4 shadow-sm w-full">
                    <Medal className="w-6 h-6 text-gray-500 mb-2" />
                    <p className="text-md font-semibold text-gray-800">{worstPartners[0]?.name || "N/A"}</p>
                    <p className="text-sm text-gray-500">Worst Partner</p>
                    <p className="text-md font-medium text-gray-700">
                      {worstPartners[0]?.wins}W / {worstPartners[0]?.losses}L
                    </p>
                  </div>
                )}
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
