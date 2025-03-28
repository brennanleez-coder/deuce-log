"use client";

import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserX, Flame, ThumbsUp } from "lucide-react";
import { Transaction } from "@prisma/client";
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
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import ShareSessionButton from "@/app/components/Sessions/ShareSessionButton";

export default function SessionPage({ params }: { params: { id: string } }) {
  const { width, height } = useWindowSize();
  const { userId, name } = useUser();
  const { transactions, addTransaction } = useTransactions(params.id);
  const [showConfetti, setShowConfetti] = useState(false);

  const router = useRouter();
  const sessionId = params.id;

  const {
    data: session,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const response = await fetch(
        `/api/badminton-sessions?sessionId=${sessionId}`
      );
      if (!response.ok) {
        toast.error("Failed to fetch session");
      }
      return response.json();
    },
    enabled: !!sessionId,
  });
  console.log("session , ", session);
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

  if (isLoading) return <Loader fullScreen />;

  const handleSubmitTransaction = async (transaction: Transaction) => {
    try {
      // Run the confetti/toast immediately (non-blocking)
      if (transaction.winningTeam === "team1") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5500); // Confetti lasts 5.5s
        toast.success(
          `🎉 You won against ${transaction.team2[0] || ""}, ${transaction.team2[1] || ""
          }!`
        );
      } else {
        toast.warning("Tough loss, but you'll get them next time! 💪", {
          icon: "😢",
          duration: 5000,
        });
      }
      const transactionPromise = addTransaction(transaction);
      await transactionPromise;
    } catch (error) {
      toast.error("Failed to add match. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans pt-16">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={500} // More confetti!
          recycle={false} // Ensures it doesn't keep looping
        />
      )}

      <div className="flex flex-col gap-y-4 max-w-5xl mx-auto">
      <header className="relative w-full bg-white/80 backdrop-blur-md border-b border-slate-100 py-3 px-4 flex items-center">
      {/* Left-aligned back button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/track")}
        className="absolute left-4 flex items-center gap-1 text-slate-600"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Back</span>
      </Button>

      {/* Centered name & fee */}
      <div className="flex flex-col items-center mx-auto">
        <h1 className="text-lg md:text-xl font-semibold text-slate-800">
          {session?.name || "Session"}
        </h1>
        {session?.courtFee != null && (
          <p className="text-sm text-slate-500">
            Court Fee: ${session.courtFee}
          </p>
        )}
      </div>
    </header>

        {/* Session Metrics Card */}
        <div className="flex items-center gap-4">
          <EditSessionModal
            sessionId={session?.id}
            currentName={session?.name}
            currentCourtFee={session?.courtFee}
            currentPlayers={session?.players}
          />
          <ShareSessionButton sessionId={session?.id} />
        </div>
        <div className="flex flex-col gap-4">
          <SessionMetrics
            matchesPlayed={matchesPlayed}
            winCount={winCount}
            lossCount={lossCount}
            netAmount={netAmount}
          />

          {/* Partner & Opponent Stats Card */}
          <div className="border border-gray-200 bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-4 w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <BestWorstPartnerCard
                name={bestPartners?.[0]?.name || "N/A"}
                wins={bestPartners?.[0]?.wins || 0}
                losses={bestPartners?.[0]?.losses || 0}
                label="Best Partner"
                icon={<Users className="w-6 h-6 text-blue-500" />}
              />
              <BestWorstPartnerCard
                name={worstPartners?.[0]?.name || "N/A"}
                wins={worstPartners?.[0]?.wins || 0}
                losses={worstPartners?.[0]?.losses || 0}
                label="Worst Partner"
                icon={<UserX className="w-6 h-6 text-gray-500" />}
              />
              <BestWorstPartnerCard
                name={toughestOpponents?.[0]?.name || "N/A"}
                wins={toughestOpponents?.[0]?.wins || 0}
                losses={toughestOpponents?.[0]?.losses || 0}
                label="Toughest Opponent"
                icon={<Flame className="w-6 h-6 text-red-500" />}
              />
              <BestWorstPartnerCard
                name={mostDefeatedOpponents?.[0]?.name || "N/A"}
                wins={mostDefeatedOpponents?.[0]?.wins || 0}
                losses={mostDefeatedOpponents?.[0]?.losses || 0}
                label="Easiest Opponent"
                icon={<ThumbsUp className="w-6 h-6 text-green-500" />}
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
                <DialogContent className="max-w-2xl w-full">
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
                <DialogContent className="max-w-2xl w-full">
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
          sharing={false}
        />
      </div>
    </main>
  );
}
