"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMatchTracker } from "@/hooks/useMatchTracker";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import TransactionForm from "@/app/components/TransactionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Transaction } from "@/types/types";
import TransactionCard from "@/app/components/TransactionCard";
import SessionMetrics from "@/app/components/SessionMetrics";
import EditSessionModal from "@/app/components/EditSessionModal";
import HeadToHeadStats from "@/app/components/HeadToHeadStats";
export default function SessionPage({ params }: { params: { id: string } }) {
  const {
    userId,
    name,
    sessions,
    addTransaction,
    fetchTransactionsBySessionId,
  } = useMatchTracker();
  const router = useRouter();
  const sessionId = params.id;

  const currentSession = sessions.find((s) => s.id === sessionId);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionTransactions, setSessionTransactions] = useState<Transaction[]>(
    []
  );

  useEffect(() => {
    if (!sessionId) return;
    const fetchTransactions = async () => {
      try {
        const data = await fetchTransactionsBySessionId(sessionId);
        setSessionTransactions(data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setSessionTransactions([]);
      }
    };
    fetchTransactions();
  }, [sessionId]);

  if (!currentSession) return <p>Loading session details...</p>;

  // Calculate session metrics
  const matchesPlayed = sessionTransactions.length;

  const winCount = sessionTransactions.filter((t) => {
    // Determine winning team: if team1's first player equals payer, winning team is team2; otherwise team1.
    const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
    return winningTeam === "team1"
      ? t.team1.includes(name)
      : t.team2.includes(name);
  }).length;

  const lossCount = sessionTransactions.filter((t) => {
    const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
    return winningTeam === "team1"
      ? t.team2.includes(name)
      : t.team1.includes(name);
  }).length;

  // Revised net gain calculation: if logged in user wins, add t.amount; if they lose, subtract t.amount.
  const netAmount = sessionTransactions.reduce((acc, t) => {
    const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
    if (winningTeam === "team1") {
      if (t.team1.includes(name)) return acc + t.amount;
      else if (t.team2.includes(name)) return acc - t.amount;
    } else {
      if (t.team2.includes(name)) return acc + t.amount;
      else if (t.team1.includes(name)) return acc - t.amount;
    }
    return acc;
  }, 0);

  // Aggregate total wins and losses amounts separately.
  const wins = sessionTransactions.filter((t) => {
    const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
    return winningTeam === "team1"
      ? t.team1.includes(name)
      : t.team2.includes(name);
  });
  const losses = sessionTransactions.filter((t) => {
    const winningTeam = t.team1[0] === t.payer ? "team2" : "team1";
    return winningTeam === "team1"
      ? t.team2.includes(name)
      : t.team1.includes(name);
  });

  const totalWinsAmount = wins.reduce((acc, t) => acc + t.amount, 0);
  const totalLossesAmount = losses.reduce((acc, t) => acc + t.amount, 0);

  const handleSubmit = async (transaction: any) => {
    await addTransaction(transaction);
    setIsOpen(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
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
            {currentSession.name}
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
            totalWinsAmount={totalWinsAmount}
            totalLossesAmount={totalLossesAmount}
          />

          <HeadToHeadStats transactions={sessionTransactions} userName={name} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wins Column */}
            <div>
              <div className="flex justify-between items-center mb-2  text-green-600">
                <h3 className="text-lg font-semibold">Wins ({winCount})</h3>
                <h3 className="text-lg font-semibold">${totalWinsAmount}</h3>
              </div>
              {wins.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">
                  No wins found.
                </p>
              ) : (
                <ul className="space-y-4">
                  {wins.map((transaction) => (
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
              <div className="flex justify-between items-center mb-2  text-red-600">
                <h3 className="text-lg font-semibold">Losses ({lossCount})</h3>
                <h3 className="text-lg font-semibold">${totalLossesAmount}</h3>
              </div>
              {losses.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">
                  No losses found.
                </p>
              ) : (
                <ul className="space-y-4">
                  {losses.map((transaction) => (
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
