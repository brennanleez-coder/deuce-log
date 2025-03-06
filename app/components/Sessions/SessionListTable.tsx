"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAllBadmintonSessionStats } from "@/hooks/useAllBadmintonSessionStats";
import { useUser } from "@/hooks/useUser";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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
import { Trash2 } from "lucide-react";
type Session = {
  id: string;
  name: string;
  courtFee: number;
  createdAt: string;
};

interface SessionListTableProps {
  sessions: Session[];
  handleSessionSelect: (sessionId: string) => void;
  handleDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  formatDate: (date: string) => string;
}

export default function SessionListTable({
  sessions,
  handleSessionSelect,
  handleDeleteSession,
  formatDate,
}: SessionListTableProps) {
  const { name, userId } = useUser();
  const [sessionStats, setSessionStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchTransactions = async () => {
      try {
        const { data } = await axios.get("/api/transactions", {
          params: { userId },
        });
        if (data.length !== 0) {
          const sessionStats = useAllBadmintonSessionStats(data, name);
          setSessionStats(sessionStats);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-left">Session</TableHead>
            <TableHead className="text-left">Date</TableHead>
            <TableHead className="text-center">Court Fee</TableHead>
            <TableHead className="text-center">Total Matches</TableHead>
            <TableHead className="text-center">Win Rate</TableHead>
            <TableHead className="text-center">Net Earnings</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const stats = sessionStats[session.id] || {
              matchesPlayed: 0,
              netAmount: 0,
              winCount: 0,
              lossCount: 0,
            };

            return (
              <TableRow
                key={session.id}
                onClick={() => handleSessionSelect(session.id)}
                className="cursor-pointer hover:bg-gray-100 transition"
              >
                <TableCell className="font-medium">{session.name}</TableCell>
                <TableCell>{formatDate(session.createdAt)}</TableCell>
                <TableCell className="text-center">
                  ${session.courtFee.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {stats?.matchesPlayed}
                </TableCell>
                <TableCell
                  className={`text-center font-semibold ${
                    stats?.matchesPlayed > 0
                      ? stats?.winCount > stats?.lossCount
                        ? "text-green-600"
                        : "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {`${((stats?.winCount / stats?.matchesPlayed) * 100).toFixed(
                    1
                  )}%`}
                </TableCell>
                <TableCell
                  className={`text-center font-semibold ${
                    stats?.netAmount >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${stats?.netAmount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Show loading message while fetching transactions */}
      {loading && (
        <div className="text-gray-500 text-center py-4">
          Loading sessions...
        </div>
      )}
    </div>
  );
}
