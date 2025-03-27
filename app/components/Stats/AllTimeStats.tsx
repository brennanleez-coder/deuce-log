"use client";

import React, { useState } from "react";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
import { Transaction } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Gamepad2,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Users,
} from "lucide-react";
import Loader from "@/components/FullScreenLoader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StatsCard from "./StatsCard";
import PartnerStats from "./PartnerStats";
import PerformanceCharts from "./PerformanceCharts";
import HeadToHeadStats from "./HeadToHeadStats";

interface AllTimeStatsProps {
  userName: string | null;
  totalSessionFees: number;
  transactions: Transaction[];
  loading: boolean;
  showGraphs?: boolean;
}

export default function AllTimeStats({
  userName,
  totalSessionFees,
  transactions,
  loading,
  showGraphs = true,
}: AllTimeStatsProps) {
  if (!transactions || !userName || typeof totalSessionFees !== "number") {
    return null;
  }

  const [includeFees, setIncludeFees] = useState(false);
  const [includeFriendly, setIncludeFriendly] = useState(true);
  const [includeFriendlyMatches, setIncludeFriendlyMatches] = useState(true);

  const statsAll = useBadmintonSessionStats(transactions, userName);
  const { matchesPlayed, netAmount, winCount, lossCount } = statsAll;

  const filteredTransactions = transactions.filter((t) => t.amount !== 0);
  const statsNoFriendly = useBadmintonSessionStats(filteredTransactions, userName);
  const {
    winCount: nfWinCount,
    lossCount: nfLossCount,
    matchesPlayed: nfMatchesPlayed,
  } = statsNoFriendly;

  const displayedMatchesPlayed = includeFriendlyMatches ? matchesPlayed : nfMatchesPlayed;
  const displayedNetAmount = includeFees ? netAmount - totalSessionFees : netAmount;
  const displayedWinCount = includeFriendly ? winCount : nfWinCount;
  const displayedLossCount = includeFriendly ? lossCount : nfLossCount;

  return (
    <div className="relative flex flex-col w-full bg-transparent text-gray-900">
      <div className="flex justify-center items-center gap-4 mb-6 mt-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="px-4 py-2">
              Head-to-Head Stats
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white border border-slate-200 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-700">
                Head-to-Head Stats
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[500px] overflow-y-auto p-4">
              <HeadToHeadStats transactions={transactions} userName={userName} />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="px-4 py-2 flex items-center gap-1">
              <Users className="w-5 h-5" />
              Partner Stats
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-full bg-white border border-slate-200 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-700">
                Partner Stats
              </DialogTitle>
            </DialogHeader>
            <div className="p-1">
              <PartnerStats transactions={transactions} userName={userName} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-6">
          <Loader />
        </div>
      ) : (
        <>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-fr gap-6 p-4">
              <StatsCard
                icon={<Gamepad2 className="w-8 h-8 text-blue-600" />}
                value={displayedMatchesPlayed}
                label="Matches Played"
                buttonLabel={
                  includeFriendlyMatches ? "Without Friendly" : "With Friendly"
                }
                onToggle={() => setIncludeFriendlyMatches((prev) => !prev)}
              />

              <StatsCard
                icon={
                  displayedNetAmount >= 0 ? (
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  )
                }
                value={`$${displayedNetAmount.toFixed(2)}`}
                label={`Net Amount ${includeFees ? "(Fees Included)" : ""}`}
                valueClassName={
                  displayedNetAmount >= 0 ? "text-green-600" : "text-red-600"
                }
                buttonLabel={includeFees ? "Hide Fees" : "Include Fees"}
                onToggle={() => setIncludeFees((prev) => !prev)}
              />

              <StatsCard
                icon={<BarChart2 className="w-8 h-8 text-gray-600" />}
                value={`${displayedWinCount}W / ${displayedLossCount}L`}
                label="Win / Loss"
                buttonLabel={includeFriendly ? "Without Friendly" : "With Friendly"}
                onToggle={() => setIncludeFriendly((prev) => !prev)}
              />
            </CardContent>

          {showGraphs && <PerformanceCharts data={transactions} />}
        </>
      )}
    </div>
  );
}
