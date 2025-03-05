"use client";

import { useState, useEffect } from "react";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
import { Transaction } from "@/types/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Gamepad2,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Medal,
} from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useUser } from "@/hooks/useUser";
import Loader from "@/components/FullScreenLoader";
import { getHeadToHeadStats } from "@/lib/utils";
import HeadToHeadTable from "./HeadToHeadTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BestWorstPartnerCard from "./BestWorstPartnerCard";

export default function AllTimeStats({
  userName,
  totalSessionFees,
}: {
  userName: string | null;
  totalSessionFees: number;
}) {
  // Bail early if props aren’t valid
  if (!userName) return null;
  if (typeof totalSessionFees !== "number") return null;

  const [includeFees, setIncludeFees] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // NEW: Toggle for friendly matches in the Win/Loss card
  const [includeFriendly, setIncludeFriendly] = useState(true);

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
    toast.success("All-Time Stats Loaded");
  }, [userId]);

  // Stats for ALL matches (including friendly)
  const statsAll = useBadmintonSessionStats(allTransactions, userName);
  const {
    matchesPlayed,
    netAmount,
    winCount,
    lossCount,
    bestPartners,
    worstPartners,
  } = statsAll;

  // Stats EXCLUDING friendly matches (amount === 0)
  const friendlyExcluded = allTransactions.filter((t) => t.amount !== 0);
  const statsNoFriendly = useBadmintonSessionStats(friendlyExcluded, userName);
  const { winCount: nfWinCount, lossCount: nfLossCount } = statsNoFriendly;

  // Decide which net amount to show (toggle from your existing code)
  const displayedNetAmount = includeFees
    ? netAmount - totalSessionFees
    : netAmount;

  // Decide which W/L counts to show
  // If "includeFriendly" is true => show overall W/L
  // Otherwise => show W/L excluding friendly matches
  const displayedWinCount = includeFriendly ? winCount : nfWinCount;
  const displayedLossCount = includeFriendly ? lossCount : nfLossCount;

  // Build Head-to-head stats array
  const statsArray = getHeadToHeadStats(allTransactions, userName);

  return (
    <Card className="bg-white border border-gray-200 shadow-md rounded-xl p-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800 text-center">
          All-Time Stats
        </CardTitle>
      </CardHeader>

      {loading ? (
        <div className="flex justify-center items-center py-6">
          <Loader />
        </div>
      ) : (
        <>
          {/* Use a grid with auto-rows so all cards remain same height */}
          <CardContent className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 auto-rows-[1fr]">
            {/* 1) Matches Played Card */}
            <Card className="flex flex-col justify-center items-center text-center p-4 shadow-sm border rounded-lg h-full">
              <Gamepad2 className="w-8 h-8 text-blue-600" />
              <p className="text-lg font-semibold mt-2">{matchesPlayed}</p>
              <p className="text-sm text-gray-500">Matches Played</p>
            </Card>

            {/* 2) Net Amount Card (with net-fees toggle) */}
            <Card className="flex flex-col justify-between items-center text-center p-4 shadow-sm border rounded-lg h-full">
              <div>
                {displayedNetAmount >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500" />
                )}
                <p
                  className={`text-lg font-semibold mt-2 ${
                    displayedNetAmount >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ${displayedNetAmount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  Net Amount
                  {includeFees ? " (Fees Included)" : ""}
                </p>
              </div>

              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIncludeFees((prev) => !prev)}
              >
                {includeFees ? "Hide Session Fees" : "Include Session Fees"}
              </Button>
            </Card>

            {/* 3) Win / Loss Count Card (with friendly toggle) */}
            <Card className="flex flex-col justify-between items-center text-center p-4 shadow-sm border rounded-lg h-full">
              <div>
                <BarChart2 className="w-8 h-8 text-gray-600" />
                <p className="text-lg font-semibold mt-2">
                  {displayedWinCount}W / {displayedLossCount}L
                </p>
                <p className="text-sm text-gray-500">Win / Loss</p>
              </div>

              {/* Friendly toggle button at bottom */}
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIncludeFriendly((prev) => !prev)}
              >
                {includeFriendly
                  ? "Exclude Friendly Matches"
                  : "Include Friendly Matches"}
              </Button>
            </Card>

            {/* 4) Best Partner Card */}
            {bestPartners?.length > 0 ? (
              <BestWorstPartnerCard
                icon={<Medal className="w-8 h-8 text-yellow-500" />}
                name={bestPartners[0]?.name}
                label="Best Partner"
                wins={bestPartners[0]?.wins}
                losses={bestPartners[0]?.losses}
                className="flex flex-col justify-center items-center text-center p-4 shadow-sm border rounded-lg h-full"
              />
            ) : (
              <Card className="flex flex-col justify-center items-center text-center p-4 shadow-sm border rounded-lg h-full">
                <Medal className="w-8 h-8 text-gray-400" />
                <p className="text-lg font-semibold mt-2">N/A</p>
                <p className="text-sm text-gray-500">Best Partner</p>
              </Card>
            )}

            {/* 5) Worst Partner Card */}
            {worstPartners?.length > 0 ? (
              <BestWorstPartnerCard
                icon={<Medal className="w-8 h-8 text-gray-700" />}
                name={worstPartners[0]?.name}
                label="Worst Partner"
                wins={worstPartners[0]?.wins}
                losses={worstPartners[0]?.losses}
                className="flex flex-col justify-center items-center text-center p-4 shadow-sm border rounded-lg h-full"
              />
            ) : (
              <Card className="flex flex-col justify-center items-center text-center p-4 shadow-sm border rounded-lg h-full">
                <Medal className="w-8 h-8 text-gray-400" />
                <p className="text-lg font-semibold mt-2">N/A</p>
                <p className="text-sm text-gray-500">Worst Partner</p>
              </Card>
            )}
          </CardContent>
        </>
      )}

      {/* Head-to-Head Stats Button */}
      <div className="flex justify-center mt-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="px-4 py-2">
              View Head-to-Head Stats
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Head-to-Head Stats
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[500px] overflow-y-auto p-4">
              <HeadToHeadTable statsArray={statsArray} showLastX={5} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
