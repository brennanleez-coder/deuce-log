// SessionListTable.tsx
"use client";

import React from "react";
import { useBadmintonSessionStats } from "@/hooks/useBadmintonSessionStats";
import { useUser } from "@/hooks/useUser";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction } from "@/types/types";
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
  transactions: Transaction[];
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
  const { name } = useUser();

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
            const { transactions } = useTransactions(session.id);
            const { matchesPlayed, winCount, lossCount, netAmount } =
              useBadmintonSessionStats(transactions, name);

            const totalGames = winCount + lossCount;
            const winRate =
              totalGames > 0 ? ((winCount / totalGames) * 100).toFixed(1) + "%" : "N/A";

            return (
              <TableRow
                key={session.id}
                onClick={() => handleSessionSelect(session.id)}
                className="cursor-pointer hover:bg-gray-100 transition"
              >
                <TableCell className="font-medium">{session.name}</TableCell>
                <TableCell>{formatDate(session.createdAt)}</TableCell>
                <TableCell className="text-center">${session.courtFee.toFixed(2)}</TableCell>
                <TableCell className="text-center">{matchesPlayed}</TableCell>
                <TableCell
                  className={`text-center font-semibold ${
                    totalGames > 0
                      ? winCount > lossCount
                        ? "text-green-600"
                        : "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {winRate}
                </TableCell>
                <TableCell
                  className={`text-center font-semibold ${
                    netAmount >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${netAmount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {/* Delete button */}
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
