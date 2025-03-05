"use client";

import React, { useState, useMemo, useRef } from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";

interface HeadToHeadTableProps {
  statsArray: {
    opponent: string;
    totalWins: number;
    totalLosses: number;
    encounters: string[];
  }[];
  showLastX?: number;
}

export default function HeadToHeadTable({ statsArray, showLastX = 3 }: HeadToHeadTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null); // Prevents auto-focus on render

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(statsArray, {
        keys: ["opponent"],
        threshold: 0.4, // Lower means stricter matching, higher allows more errors
      }),
    [statsArray]
  );

  // Get filtered results
  const filteredStats = useMemo(() => {
    if (!searchQuery) return statsArray;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse]);

  if (statsArray.length === 0) return null;

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="sticky top-0 bg-white z-10 py-3">
        <Input
          ref={inputRef} // Prevents auto-focus on render
          type="text"
          placeholder="Search opponent..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md mx-auto border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table Wrapper with Overflow Auto */}
      <div className="overflow-auto max-h-[400px] border border-gray-200 rounded-md shadow-sm mt-3">
        <table className="w-full border-collapse text-sm text-center">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-3 text-gray-700">Opponent</th>
              <th className="p-3 text-gray-700">W / L</th>
              <th className="p-3 text-gray-700">Last {showLastX}</th>
            </tr>
          </thead>
          <tbody>
            {filteredStats.map(({ opponent, totalWins, totalLosses, encounters }) => {
              const lastX = encounters.slice(-showLastX);

              return (
                <tr key={opponent} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800 whitespace-nowrap">{opponent}</td>
                  <td className="p-3 text-gray-700">{`${totalWins}W / ${totalLosses}L`}</td>
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

      {/* No Results Found */}
      {filteredStats.length === 0 && (
        <div className="text-gray-500 text-center py-4">No matches found.</div>
      )}
    </div>
  );
}
