"use client";

import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Medal } from "lucide-react";
import { Transaction } from "@/types/types";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SessionMetrics from "@/app/components/Stats/SessionMetrics";
import EditSessionModal from "@/app/components/Sessions/EditSessionModal";
import HeadToHeadStats from "@/app/components/Stats/HeadToHeadStats";
import PartnerStats from "@/app/components/Stats/PartnerStats";
import Loader from "@/components/FullScreenLoader";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";
import BestWorstPartnerCard from "@/app/components/Stats/BestWorstPartnerCard";
import TransactionList from "@/app/components/Transactions/TransactionList";

export default function SessionPage({ params }: { params: { id: string } }) {
  const { userId, name } = useUser();
  const { sessions } = useBadmintonSessions();
  const { transactions, addTransaction } = useTransactions(params.id);
  const router = useRouter();
  const sessionId = params.id;
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const currentSession = sessions.find((s) => s.id === sessionId);

  const {
    matchesPlayed,
    winCount,
    lossCount,
    netAmount,
    wins,
    losses,
    totalWinsAmount,
    totalLossesAmount,
    bestPartners,
    worstPartners,
    toughestOpponents,
    mostDefeatedOpponents,
  } = useBadmintonSessionStats(transactions, name);

  if (!currentSession) return <Loader fullScreen />;

  const handleSubmitTransaction = async (transaction: Transaction) => {
    await addTransaction(transaction);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-6 font-sans">
      <div className="flex flex-col gap-y-4 max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/track")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentSession?.name}
          </h1>
          <EditSessionModal
            sessionId={currentSession.id}
            currentName={currentSession.name}
            currentCourtFee={currentSession.courtFee}
            currentPlayers={currentSession.players}
          />
        </header>

        {/* Session Metrics Card */}
        <div className="flex flex-col gap-4">
          <SessionMetrics
            matchesPlayed={matchesPlayed}
            winCount={winCount}
            lossCount={lossCount}
            netAmount={netAmount}
          />

          {/* Partner & Opponent Stats Card */}
          <div className="border border-gray-200 bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-4 w-full">
            {/* Stats Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <BestWorstPartnerCard
                name={bestPartners?.[0]?.name || "N/A"}
                wins={bestPartners?.[0]?.wins || 0}
                losses={bestPartners?.[0]?.losses || 0}
                label="Best Partner"
                icon={<Medal className="w-6 h-6 text-yellow-500" />}
              />
              <BestWorstPartnerCard
                name={worstPartners?.[0]?.name || "N/A"}
                wins={worstPartners?.[0]?.wins || 0}
                losses={worstPartners?.[0]?.losses || 0}
                label="Worst Partner"
                icon={<Medal className="w-6 h-6 text-gray-500" />}
              />
              <BestWorstPartnerCard
                name={toughestOpponents?.[0]?.name || "N/A"}
                wins={toughestOpponents?.[0]?.wins || 0}
                losses={toughestOpponents?.[0]?.losses || 0}
                label="Toughest Opponent"
                icon={<Medal className="w-6 h-6 text-red-500" />}
              />
              <BestWorstPartnerCard
                name={mostDefeatedOpponents?.[0]?.name || "N/A"}
                wins={mostDefeatedOpponents?.[0]?.wins || 0}
                losses={mostDefeatedOpponents?.[0]?.losses || 0}
                label="Most Defeated Opponent"
                icon={<Medal className="w-6 h-6 text-green-500" />}
              />
            </div>

            {/* Dialog Buttons */}
            <div className="flex flex-col gap-4 self-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Users className="w-5 h-5" /> H2H Stats
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl w-full">
                  <DialogHeader>
                    <DialogTitle>Head-to-Head Stats</DialogTitle>
                  </DialogHeader>
                  <HeadToHeadStats
                    transactions={transactions}
                    userName={name}
                  />
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Users className="w-5 h-5" /> Partner Stats
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl w-full">
                  <DialogHeader>
                    <DialogTitle>Partner Stats</DialogTitle>
                  </DialogHeader>
                  <PartnerStats transactions={transactions} userName={name} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <TransactionList
          userId={userId}
          name={name}
          sessionId={sessionId}
          addTransaction={handleSubmitTransaction}
          transactions={transactions}
          wins={wins}
          losses={losses}
          winCount={winCount}
          lossCount={lossCount}
          totalWinsAmount={totalWinsAmount}
          totalLossesAmount={totalLossesAmount}
        />
      </div>
    </main>
  );
}
