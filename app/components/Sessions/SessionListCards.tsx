"use client";

import React, { useEffect, useState } from "react";
import { useAllBadmintonSessionStats } from "@/hooks/useAllBadmintonSessionStats";
import { useUser } from "@/hooks/useUser";
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
  console.log("sessions", sessions);
  const { name, userId } = useUser();
  const sessionStats = useAllBadmintonSessionStats(
    sessions.flatMap((s) => s.transactions),
    name
  );
  const [loading, setLoading] = useState(false);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => {
        const stats = sessionStats[session.id] || {
          matchesPlayed: 0,
          netAmount: 0,
          winCount: 0,
          lossCount: 0,
        };

        const winRate = stats.matchesPlayed
          ? ((stats.winCount / stats.matchesPlayed) * 100).toFixed(2)
          : "0.00";

        return (
          <div
            key={session.id}
            onClick={() => handleSessionSelect(session.id)}
            className="cursor-pointer"
          >
            <Card
              key={session.id}
              onClick={() => handleSessionSelect(session.id)}
              className="cursor-pointer p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group"
            >
              {/* Header: Name + Delete */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 truncate">
                  {session.name}
                </h2>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-70 hover:opacity-100 transition"
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
                      <strong>{session.name}</strong>? This action cannot be
                      undone.
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

              {/* Session Meta (Date, Court Fee) */}
              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(session.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span>${session.courtFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="flex justify-between items-end mt-auto pt-2 border-t border-gray-100">
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <BarChart2 className="w-4 h-4 text-blue-500" />
                    <span>{stats.matchesPlayed} Matches</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">Win Rate:</span>
                    <span
                      className={`font-medium ${
                        stats.winCount > stats.lossCount
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {winRate}%
                    </span>
                  </div>
                </div>

                {/* Net Amount Badge */}
                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    stats.netAmount >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {stats.netAmount >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  ${stats.netAmount.toFixed(2)}
                </div>
              </div>
            </Card>
          </div>
        );
      })}

      {loading && (
        <div className="text-gray-500 text-center py-4">
          Loading sessions...
        </div>
      )}
    </div>
  );
}
