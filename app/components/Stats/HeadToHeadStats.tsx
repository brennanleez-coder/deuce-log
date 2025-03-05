"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Medal } from "lucide-react";

import { getHeadToHeadStats, getBestAndWorstPartners } from "@/lib/utils";
import HeadToHeadTable from "./HeadToHeadTable";
import { Transaction } from "@/types/types";

import BestWorstPartnerCard from "@/app/components/Stats/BestWorstPartnerCard";
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


    const { bestPartners, worstPartners } = useBadmintonSessionStats(
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
    <div className="bg-white rounded-lg shadow-md">
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
                  <BestWorstPartnerCard
                    name={bestPartners[0]?.name}
                    label="Best Partner"
                    wins={bestPartners[0]?.wins}
                    losses={bestPartners[0]?.losses}
                    icon={<Medal className="w-6 h-6 text-yellow-500 mb-2" />}
                    className="flex flex-col items-center text-center border rounded-lg p-4 shadow-sm w-full"
                  />
                )}

                {/* Worst Partner */}
                {worstPartners?.length > 0 && (
                  <BestWorstPartnerCard
                    name={worstPartners[0]?.name}
                    label="Worst Partner"
                    wins={worstPartners[0]?.wins}
                    losses={worstPartners[0]?.losses}
                    icon={<Medal className="w-6 h-6 text-gray-500 mb-2" />}
                    className="flex flex-col items-center text-center border rounded-lg p-4 shadow-sm w-full"
                  />
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
