"use client";

import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Users } from "lucide-react";
import TransactionForm from "@/app/components/Transactions/TransactionForm";
import { Transaction } from "@/types/types";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TransactionCard from "@/app/components/Transactions/TransactionCard";
import SessionMetrics from "@/app/components/Stats/SessionMetrics";
import EditSessionModal from "@/app/components/Sessions/EditSessionModal";
import HeadToHeadStats from "@/app/components/Stats/HeadToHeadStats";
import Loader from "@/components/FullScreenLoader";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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

          {/* Head-to-Head Preview with Dialog */}
          <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
            <DialogTrigger asChild>
              <div className="cursor-pointer bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <div className="text-center">
                  <p className="text-sm text-green-600">Best Partner</p>
                  {bestPartners &&
                    (bestPartners.length > 0 ? bestPartners[0].name : "N/A")}
                </div>
                <div className="text-center">
                  <p className="text-sm text-red-600">Worst Partner</p>
                  {worstPartners &&
                    (worstPartners.length > 0 ? worstPartners[0].name : "N/A")}
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  View Stats
                </Button>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Head-to-Head Stats</DialogTitle>
              </DialogHeader>
              <HeadToHeadStats transactions={transactions} userName={name} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Transactions Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Matches</h2>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setIsOpen(true)}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Match Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm
                  userId={userId}
                  name={name}
                  sessionId={sessionId}
                  onSubmit={handleSubmit}
                  isEditing={false}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="mb-4 flex justify-center items-center gap-2">
            <Search className="w-5 h-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by player, partner, or opponent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wins Column */}
            <div>
              <div className="flex justify-between items-center mb-2 text-green-600">
                <h3 className="text-lg font-semibold">Wins ({winCount})</h3>
                <h3 className="text-lg font-semibold">${totalWinsAmount}</h3>
              </div>
              {filteredTransactions.wins.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">
                  No wins found.
                </p>
              ) : (
                <ul className="space-y-4">
                  {filteredTransactions.wins.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </ul>
              )}
            </div>
            {/* Losses Column */}
            <div>
              <div className="flex justify-between items-center mb-2 text-red-600">
                <h3 className="text-lg font-semibold">Losses ({lossCount})</h3>
                <h3 className="text-lg font-semibold">${totalLossesAmount}</h3>
              </div>
              {filteredTransactions.losses.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">
                  No losses found.
                </p>
              ) : (
                <ul className="space-y-4">
                  {filteredTransactions.losses.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
