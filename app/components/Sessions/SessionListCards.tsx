"use client";

import React from "react";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
import { useUser } from "@/hooks/useUser";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction } from "@/types/types";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Calendar,
  DollarSign,
  BarChart2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type Session = {
  id: string;
  name: string;
  courtFee: number;
  createdAt: string;
  transactions: Transaction[];
};

interface SessionListCardsProps {
  sessions: Session[];
  handleSessionSelect: (sessionId: string) => void;
  handleDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  formatDate: (date: string) => string;
}

export default function SessionListCards({
  sessions,
  handleSessionSelect,
  handleDeleteSession,
  formatDate,
}: SessionListCardsProps) {
  const { name } = useUser();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => {
        const { transactions } = useTransactions(session.id);
        const { matchesPlayed, winCount, lossCount, netAmount } =
          useBadmintonSessionStats(transactions, name);

        const totalGames = winCount + lossCount;
        const hasMatches = totalGames > 0;
        const winRate = hasMatches ? ((winCount / totalGames) * 100).toFixed(1) + "%" : "N/A";

        return (
          <div
            key={session.id}
            onClick={() => handleSessionSelect(session.id)}
            className="cursor-pointer"
          >
            <Card className="p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 rounded-lg flex flex-col justify-between h-full">
              {/* Header: Session Name + Delete Button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{session.name}</h2>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    className="max-w-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <p className="text-gray-600 px-4">
                      Are you sure you want to delete{" "}
                      <strong>{session.name}</strong>? This action cannot be undone.
                    </p>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Two-column grid layout for better space utilization */}
              <div className="grid grid-cols-2 gap-4 text-gray-600">
                {/* Left Column */}
                <div className="space-y-2">
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>{formatDate(session.createdAt)}</span>
                  </div>

                  {/* Court Fee */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                    <span>${session.courtFee.toFixed(2)}</span>
                  </div>

                  {/* Matches Played */}
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-500" />
                    <span>{matchesPlayed} Matches</span>
                  </div>
                </div>

                {/* Right Column - Using Chips (Only show if there are matches) */}
                {hasMatches && (
                  <div className="flex flex-col gap-2">
                    {/* Win Rate Chip */}
                    <Badge
                      className={`text-sm py-1 px-2 w-fit ${
                        winCount > lossCount
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {winRate} Win Rate
                    </Badge>

                    {/* Net Amount Chip */}
                    <Badge
                      className={`text-sm py-1 px-2 w-fit ${
                        netAmount >= 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {netAmount >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1 inline" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1 inline" />
                      )}
                      ${netAmount.toFixed(2)}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
