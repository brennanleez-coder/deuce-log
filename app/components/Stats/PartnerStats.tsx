"use client";

import React from "react";
import { Medal } from "lucide-react";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
import HeadToHeadTable from "./HeadToHeadTable";
import { Transaction } from "@/types/types";
import { getHeadToHeadStats } from "@/lib/utils";
import BestWorstPartnerCard from "@/app/components/Stats/BestWorstPartnerCard";
interface HeadToHeadStatsProps {
  transactions: Transaction[];
  userName: string;
}

export default function HeadToHeadStats({
  transactions,
  userName,
}: HeadToHeadStatsProps) {
  const { bestPartners, worstPartners } = useBadmintonSessionStats(
    transactions,
    userName
  );

  if (
    (!bestPartners || bestPartners.length === 0) &&
    (!worstPartners || worstPartners.length === 0)
  ) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mt-4">
        <h3 className="text-lg font-semibold mb-2">Partner Performance</h3>
        <p className="text-gray-500">No partner performance data available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 border border-gray-200 max-h-[80vh] overflow-y-auto">
      <h4 className="text-md font-semibold text-gray-700 mb-3 text-center">
        Partner Performance
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
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
    </div>
  );
}
