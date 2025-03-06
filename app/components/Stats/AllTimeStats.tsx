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
  Users
} from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useUser } from "@/hooks/useUser";
import Loader from "@/components/FullScreenLoader";
import { getHeadToHeadStats, getPartnerStats } from "@/lib/utils";
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
import StatsCard from "./StatsCard";
import PartnerStats from "./PartnerStats";
import PerformanceCharts from "./PerformanceCharts";
import HeadToHeadStats from "./HeadToHeadStats";

interface AllTimeStatsProps  {
  userName: string | null;
  totalSessionFees: number;
  transactions: Transaction[];
  loading: boolean;
}

export default function AllTimeStats({
  userName,
  totalSessionFees,
  transactions,
  loading,
}: AllTimeStatsProps) {
  if (!transactions) return null;
  if (!userName) return null;
  if (typeof totalSessionFees !== "number") return null;

  const [includeFees, setIncludeFees] = useState(false);
  const [includeFriendly, setIncludeFriendly] = useState(true);
  const [includeFriendlyMatches, setIncludeFriendlyMatches] = useState(true);

  const statsAll = useBadmintonSessionStats(transactions, userName);
  const {
    matchesPlayed,
    netAmount,
    winCount,
    lossCount,
  } = statsAll;

  const filteredTransactions = transactions.filter((t) => t.amount !== 0);
  const statsNoFriendly = useBadmintonSessionStats(
    filteredTransactions,
    userName
  );
  const {
    winCount: nfWinCount,
    lossCount: nfLossCount,
    matchesPlayed: nfMatchesPlayed,
  } = statsNoFriendly;

  const displayedMatchesPlayed = includeFriendlyMatches
    ? matchesPlayed
    : nfMatchesPlayed;
  const displayedNetAmount = includeFees
    ? netAmount - totalSessionFees
    : netAmount;
  const displayedWinCount = includeFriendly ? winCount : nfWinCount;
  const displayedLossCount = includeFriendly ? lossCount : nfLossCount;

  

  return (
    <Card className="bg-white border border-gray-200 shadow-md rounded-xl p-4">
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
          <CardContent className="grid grid-cols-3 auto-rows-[1fr] gap-x-12">
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
              buttonLabel={
                includeFees ? "Hide Fees" : "Include Fees"
              }
              onToggle={() => setIncludeFees((prev) => !prev)}
            />

            <StatsCard
              icon={<BarChart2 className="w-8 h-8 text-gray-600" />}
              value={`${displayedWinCount}W / ${displayedLossCount}L`}
              label="Win / Loss"
              buttonLabel={
                includeFriendly ? "Without Friendly" : "With Friendly"
              }
              onToggle={() => setIncludeFriendly((prev) => !prev)}
            />
          </CardContent>
          <PerformanceCharts data={transactions} />

        </>
      )}

      <div className="flex justify-center gap-x-2">
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
              {/* <HeadToHeadTable statsArray={h2hStatsArray} showLastX={5} /> */}
              <HeadToHeadStats transactions={transactions} userName={userName} />
            </div>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="px-4 py-2">
              <Users className="w-5 h-5" /> Partner Stats
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl w-full">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Partner Stats
              </DialogTitle>
            </DialogHeader>
            <PartnerStats transactions={transactions} userName={userName} />
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
