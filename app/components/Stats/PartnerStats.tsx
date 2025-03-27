"use client";

import React from "react";
import { Medal } from "lucide-react";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
import { Transaction } from "@prisma/client";

import BestWorstPartnerCard from "@/app/components/Stats/BestWorstPartnerCard";
import PartnerPerformanceTable from "@/app/components/Stats/PartnerPerformanceTable";
import { getPartnerStats } from "@/lib/utils";

interface PartnerStatsProps {
  transactions: Transaction[];
  userName: string;
}

export default function PartnerStats({
  transactions,
  userName,
}: PartnerStatsProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white p-4 mt-4">
        <p className="text-gray-500">No partner performance data available.</p>
      </div>
    );
  }

  const { bestPartners, worstPartners } = useBadmintonSessionStats(
    transactions,
    userName
  );
  console.log("worstPartners , ", worstPartners);

  const partnerStats = getPartnerStats(transactions, userName);

  return (
    <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-4 border border-gray-200 max-h-[80vh] overflow-y-auto">
      <h4 className="text-md font-semibold text-gray-700 mb-3 text-center">
        Partner Performance
      </h4>

      {/* Best & Worst Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mb-4">
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

      {/* Partner Performance Table */}
      <PartnerPerformanceTable partnerStats={partnerStats} />
    </div>
  );
}
