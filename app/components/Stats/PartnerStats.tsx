"use client";

import React from "react";
import { Medal } from "lucide-react";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
import HeadToHeadTable from "./HeadToHeadTable";
import { Transaction } from "@/types/types";
import { getHeadToHeadStats } from "@/lib/utils";
interface HeadToHeadStatsProps {
  transactions: Transaction[];
  userName: string;
}

export default function HeadToHeadStats({
  transactions,
  userName,
}: HeadToHeadStatsProps) {
  const { toughestOpponents, mostDefeatedOpponents } = useBadmintonSessionStats(
    transactions,
    userName
  );

  const statsArray = getHeadToHeadStats(transactions, userName);


  if (statsArray.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Head-to-Head Stats</h3>
        <p className="text-gray-500 mt-2">No head-to-head data available.</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 max-h-[80vh] overflow-y-auto">
      {/* Podium Header */}
      <h4 className="text-lg font-semibold text-gray-900 text-center mb-6">
        Opponent Podium 🏆
      </h4>

      {/* Podium Layout */}
      <div className="grid grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
        {/* Toughest Opponents - Rivals */}
        <div className="flex flex-col items-center gap-4">
          <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Most Challenging Opponents
          </h5>
          {toughestOpponents?.map((opponent, index) => (
            <div key={opponent.name} className="flex flex-col items-center">
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
            Most Defeated Opponents
          </h5>
          {mostDefeatedOpponents?.map((opponent, index) => (
            <div key={opponent.name} className="flex flex-col items-center">
              <Medal className="w-6 h-6 text-gray-600 mb-1" />
              <p className="text-md font-semibold">{opponent.name}</p>
              <p className="text-sm text-gray-600">
                Wins: {opponent.wins} | Losses: {opponent.losses}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Head-to-Head Table */}
      {/* <HeadToHeadTable statsArray={statsArray} /> */}
    </div>
  );
}
