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
import Loader from "@/components/FullScreenLoader";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";
import Fuse from "fuse.js";
import BestWorstPartnerCard from "@/app/components/Stats/BestWorstPartnerCard";
import TransactionList from "@/app/components/Transactions/TransactionList";
export default function SessionPage({ params }: { params: { id: string } }) {
  const { userId, name } = useUser();
  const { sessions } = useBadmintonSessions();
  const { transactions, addTransaction } = useTransactions(params.id);
  const router = useRouter();
  const sessionId = params.id;
  const [isOpen, setIsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const currentSession = sessions.find((s) => s.id === sessionId);
  const [searchQuery, setSearchQuery] = useState("");

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
  } = useBadmintonSessionStats(transactions, name);

  // Get filtered transactions for both wins and losses
  const filteredTransactions = useMemo(() => {
    const fuse = new Fuse(transactions, {
      keys: ["team1", "team2"], // Searching across all players
      threshold: 0.0, // Allows slight typos
    });

    if (!searchQuery) return { wins, losses };
    const results = fuse.search(searchQuery).map((result) => result.item);
    return {
      wins: results.filter((t) => wins.includes(t)) || [],
      losses: results.filter((t) => losses.includes(t)) || [],
    };
  }, [searchQuery, transactions, wins, losses]);

  if (!currentSession) return <Loader fullScreen />;

  const handleSubmit = async (transaction: Transaction) => {
    await addTransaction(transaction);
    setIsOpen(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
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

        {/* Session Metrics Section */}
        <div className="flex flex-col space-y-6 mb-6">
          <SessionMetrics
            matchesPlayed={matchesPlayed}
            winCount={winCount}
            lossCount={lossCount}
            netAmount={netAmount}
          />

          <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
            <DialogTrigger asChild>
              <div
                className="cursor-pointer bg-white p-4 rounded-lg shadow-md 
                 flex flex-col md:flex-row gap-4 w-full md:items-center 
                 md:justify-between"
              >
                {/* Container that grows on desktop */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Best Partner Card */}
                  {bestPartners?.length > 0 ? (
                    <BestWorstPartnerCard
                      name={bestPartners[0].name}
                      wins={bestPartners[0].wins}
                      losses={bestPartners[0].losses}
                      label="Best Partner"
                      icon={<Medal className="w-8 h-8 text-yellow-500" />}
                      className="w-full sm:w-1/2"
                    />
                  ) : (
                    <BestWorstPartnerCard
                      name="N/A"
                      wins={0}
                      losses={0}
                      label="Best Partner"
                      icon={<Medal className="w-8 h-8 text-gray-700" />}
                      className="w-full sm:w-1/2"
                    />
                  )}

                  {/* Worst Partner Card */}
                  {worstPartners?.length > 0 ? (
                    <BestWorstPartnerCard
                      name={worstPartners[0].name}
                      wins={worstPartners[0].wins}
                      losses={worstPartners[0].losses}
                      label="Worst Partner"
                      icon={<Medal className="w-8 h-8 text-gray-700" />}
                      className="w-full sm:w-1/2"
                    />
                  ) : (
                    <BestWorstPartnerCard
                      name="N/A"
                      wins={0}
                      losses={0}
                      label="Worst Partner"
                      icon={<Medal className="w-8 h-8 text-yellow-500" />}
                      className="w-full sm:w-1/2"
                    />
                  )}
                </div>

                {/* The "View Stats" button */}
                <Button
                  variant="outline"
                  className="flex items-center gap-2 self-end md:self-center"
                >
                  <Users className="w-5 h-5" />
                  View Stats
                </Button>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-3xl w-full">
              <DialogHeader>
                <DialogTitle>Head-to-Head Stats</DialogTitle>
              </DialogHeader>
              <HeadToHeadStats transactions={transactions} userName={name} />
            </DialogContent>
          </Dialog>
        </div>
        
        <TransactionList
          userId={userId}
          name={name}
          sessionId={sessionId}
          addTransaction={handleSubmit}
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
