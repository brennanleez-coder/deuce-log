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
}: {
  userName: string | null;
}) {
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
    toast.success("All-Time Stats Loaded");
  }, [userId]);

  const {
    matchesPlayed,
    netAmount,
    winCount,
    lossCount,
    bestPartners,
    worstPartners,
  } = useBadmintonSessionStats(allTransactions, userName);

  const statsArray = getHeadToHeadStats(allTransactions, userName as string);

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
        // CardContent containing your stat cards
        <CardContent className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Matches Played */}
          <Card className="flex flex-col items-center text-center p-4 shadow-sm border rounded-lg">
            <Gamepad2 className="w-8 h-8 text-blue-600" />
            <p className="text-lg font-semibold mt-2">{matchesPlayed}</p>
            <p className="text-sm text-gray-500">Matches Played</p>
          </Card>

          {/* Net Amount */}
          <Card className="flex flex-col items-center text-center p-4 shadow-sm border rounded-lg">
            {netAmount >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-500" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-500" />
            )}
            <p
              className={`text-lg font-semibold mt-2 ${
                netAmount >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${netAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Net Amount</p>
          </Card>

          {/* Win / Loss Count */}
          <Card className="flex flex-col items-center text-center p-4 shadow-sm border rounded-lg">
            <BarChart2 className="w-8 h-8 text-gray-600" />
            <p className="text-lg font-semibold mt-2">
              {winCount}W / {lossCount}L
            </p>
            <p className="text-sm text-gray-500">Win / Loss</p>
          </Card>

          {/* Best Partner (PartnerCard) */}
          {bestPartners?.length > 0 && (
            <BestWorstPartnerCard
              icon={<Medal className="w-8 h-8 text-yellow-500" />}
              name={bestPartners[0]?.name}
              label="Best Partner"
              wins={bestPartners[0]?.wins}
              losses={bestPartners[0]?.losses}
            />
          )}

          {/* Worst Partner (PartnerCard) */}
          {worstPartners?.length > 0 && (
            <BestWorstPartnerCard
              icon={<Medal className="w-8 h-8 text-gray-700" />}
              name={worstPartners[0]?.name}
              label="Worst Partner"
              wins={worstPartners[0]?.wins}
              losses={worstPartners[0]?.losses}
            />
          )}
        </CardContent>
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
