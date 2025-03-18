"use client";

import React, { useState, useMemo, useRef } from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";

interface PartnerTableProps {
  partnerStats: {
    partner: string;
    totalWins: number;
    totalLosses: number;
    encounters: string[];
  }[];
  showLastX?: number;
}

export default function PartnerPerformanceTable({
  partnerStats,
  showLastX = 3,
}: PartnerTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null); // Prevent auto-focus on render

  const fuse = useMemo(
    () =>
      new Fuse(partnerStats, {
        keys: ["partner"],
        threshold: 0.4, // Lower = stricter matching
      }),
    [partnerStats]
  );

  const filteredStats = useMemo(() => {
    if (!searchQuery) return partnerStats;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse]);

  if (partnerStats.length === 0) return null;

  return (
    <div className="w-full">
      <div className="sticky top-0 bg-white z-10 py-3">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search partner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md mx-auto border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-auto max-h-[400px] border border-gray-200 rounded-md shadow-sm mt-3">
        <table className="w-full border-collapse text-sm text-center">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-3 text-gray-700">Partner</th>
              <th className="p-3 text-gray-700">W / L</th>
              <th className="p-3 text-gray-700">Last {showLastX}</th>
            </tr>
          </thead>
          <tbody>
            {filteredStats.map(({ partner, totalWins, totalLosses, encounters }) => {
              const lastX = encounters.slice(-showLastX);

              return (
                <tr key={partner} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800 whitespace-nowrap">{partner}</td>
                  <td className="p-3 text-gray-700">{`${totalWins} / ${totalLosses}`}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      {lastX.map((result, i) => (
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
      </div>

      {filteredStats.length === 0 && (
        <div className="text-gray-500 text-center py-4">No partners found.</div>
      )}
    </div>
  );
}
