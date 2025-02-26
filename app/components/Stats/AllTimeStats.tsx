"use client";

import { useState, useEffect } from "react";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
import { Transaction } from "@/types/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp, TrendingDown, Users } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useUser } from "@/hooks/useUser";
import Loader from "@/components/FullScreenLoader"; // Import Loader component

export default function AllTimeStats({ userName }: { userName: string | null }) {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { fetchTransactionsByUserId } = useTransactions(null);
  const { userId } = useUser();

  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetchTransactionsByUserId(userId).then((data) => {
        if (data) setAllTransactions(data);
        setLoading(false);
      });
    }
  }, [userId]);

  const {
    matchesPlayed,
    netAmount,
    winCount,
    lossCount,
    bestPartners,
    worstPartners,
  } = useBadmintonSessionStats(allTransactions, userName);

  return (
    <Card className="bg-white border border-gray-200 shadow-md rounded-xl p-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800 text-center">
          All-Time Stats
        </CardTitle>
      </CardHeader>

      {loading ? (
        <div className="flex justify-center items-center py-6">
          <Loader /> {/* Show loader while data is fetching */}
        </div>
      ) : (
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-center">
          {/* Matches Played */}
          <div className="flex flex-col items-center text-center">
            <Trophy className="w-8 h-8 text-blue-600" />
            <p className="text-lg font-semibold">{matchesPlayed}</p>
            <p className="text-sm text-gray-500">Matches Played</p>
          </div>

          {/* Net Amount */}
          <div className="flex flex-col items-center text-center">
            {netAmount >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-500" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-500" />
            )}
            <p
              className={`text-lg font-semibold ${
                netAmount >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${netAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Net Amount</p>
          </div>

          {/* Win / Loss Count */}
          <div className="flex flex-col items-center text-center">
            <Users className="w-8 h-8 text-gray-600" />
            <p className="text-lg font-semibold">
              {winCount}W / {lossCount}L
            </p>
            <p className="text-sm text-gray-500">Win / Loss</p>
          </div>

          {/* Best Partner */}
          {bestPartners?.length > 0 && (
            <div className="flex flex-col items-center text-center">
              <Users className="w-8 h-8 text-green-600" />
              <p className="text-lg font-semibold">{bestPartners[0]?.name || "N/A"}</p>
              <p className="text-sm text-gray-500">Best Partner</p>
            </div>
          )}

          {/* Worst Partner */}
          {worstPartners?.length > 0 && (
            <div className="flex flex-col items-center text-center">
              <Users className="w-8 h-8 text-red-600" />
              <p className="text-lg font-semibold">{worstPartners[0]?.name || "N/A"}</p>
              <p className="text-sm text-gray-500">Worst Partner</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
