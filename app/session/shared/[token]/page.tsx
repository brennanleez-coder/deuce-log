"use client";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Users, UserX, Flame, ThumbsUp } from "lucide-react";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SessionMetrics from "@/app/components/Stats/SessionMetrics";
import HeadToHeadStats from "@/app/components/Stats/HeadToHeadStats";
import PartnerStats from "@/app/components/Stats/PartnerStats";
import Loader from "@/components/FullScreenLoader";
import BestWorstPartnerCard from "@/app/components/Stats/BestWorstPartnerCard";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import TransactionList from "@/app/components/Transactions/TransactionList";

export default function SharedSessionPage({
  params,
}: {
  params: { token: string };
}) {
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["session", params.token],
    queryFn: async () => {
      const res = await fetch(
        `/api/badminton-sessions/validate?token=${params.token}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error("Session not found.");
      }
      return data.session;
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const transactions = session?.transactions || [];
  const {
    matchesPlayed,
    winCount,
    lossCount,
    netAmount,
    totalWinsAmount,
    totalLossesAmount,
    wins,
    losses,
    bestPartners,
    worstPartners,
    toughestOpponents,
    mostDefeatedOpponents,
  } = useBadmintonSessionStats(transactions, session?.user?.name);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!session) {
    return <div className="text-center">No session available</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pt-16 w-full">
      <div className="flex flex-col items-center justify-between">
        <h1 className="text-2xl font-bold">Session: {session.name}</h1>
        {/* add timestamp */}
        <p className="text-gray-500 text-sm">
          {new Date(session.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex flex-col gap-4 mt-6">
        <SessionMetrics
          matchesPlayed={matchesPlayed}
          winCount={winCount}
          lossCount={lossCount}
          netAmount={netAmount}
        />
        <div className="border border-gray-200 bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
            <BestWorstPartnerCard
              name={bestPartners?.[0]?.name}
              wins={bestPartners?.[0]?.wins}
              losses={bestPartners?.[0]?.losses}
              label="Best Partner"
              icon={<Users className="w-6 h-6 text-blue-500" />}
            />
            <BestWorstPartnerCard
              name={worstPartners?.[0]?.name}
              wins={worstPartners?.[0]?.wins}
              losses={worstPartners?.[0]?.losses}
              label="Worst Partner"
              icon={<UserX className="w-6 h-6 text-gray-500" />}
            />
            <BestWorstPartnerCard
              name={toughestOpponents?.[0]?.name}
              wins={toughestOpponents?.[0]?.wins}
              losses={toughestOpponents?.[0]?.losses}
              label="Toughest Opponent"
              icon={<Flame className="w-6 h-6 text-red-500" />}
            />
            <BestWorstPartnerCard
              name={mostDefeatedOpponents?.[0]?.name}
              wins={mostDefeatedOpponents?.[0]?.wins}
              losses={mostDefeatedOpponents?.[0]?.losses}
              label="Most Defeated Opponent"
              icon={<ThumbsUp className="w-6 h-6 text-green-500" />}
            />
          </div>
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
                  transactions={session.transactions}
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
                <PartnerStats
                  transactions={session.transactions}
                  userName={name}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <TransactionList
          userId={session?.user?.id}
          name={session?.user?.name}
          sessionId={session?.id}
          transactions={session?.transactions}
          wins={wins}
          losses={losses}
          winCount={winCount}
          lossCount={lossCount}
          totalWinsAmount={totalWinsAmount}
          totalLossesAmount={totalLossesAmount}
        />
      </div>
    </div>
  );
}
