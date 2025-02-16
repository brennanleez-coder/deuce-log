"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Transaction, Session } from "@/types/types";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import SessionStatsDialog from "./SessionStatsDialog";

interface TransactionInterfaceProps {
  user: string;
  sessionId: string;
  sessions: Session[];
  addTransaction: (
    sessionId: string,
    type: "Match" | "SideBet",
    amount: number,
    players: string[],
    payerIndex: number,
    receiverIndex: number,
    bettorWon?: boolean,
    userSide?: "Bettor" | "Bookmaker"
  ) => void;
  updateTransaction: (
    transactionId: string,
    type: "Match" | "SideBet",
    amount: number,
    players: string[],
    payerIndex: number,
    receiverIndex: number,
    bettorWon?: boolean,
    userSide?: "Bettor" | "Bookmaker"
  ) => void;
  markTransactionPaid: (transactionId: string, paidBy: string) => void;
  markTransactionUnpaid: (transactionId: string, user: string) => void;
  transactions: Transaction[];
  addPlayerToSession: (sessionId: string, playerName: string) => void;
}

export default function TransactionInterface({
  user,
  sessionId,
  sessions,
  addTransaction,
  updateTransaction,
  transactions,
  markTransactionPaid,
  markTransactionUnpaid,
  addPlayerToSession,
}: TransactionInterfaceProps) {
  // If no session is currently selected, bail out
  if (!sessionId) return null;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"Match" | "SideBet">(
    "Match"
  );
  const [amount, setAmount] = useState("");
  const [players, setPlayers] = useState<string[]>([user, "", "", "", "", ""]);
  const [payerIndex, setPayerIndex] = useState(2);
  const [receiverIndex, setReceiverIndex] = useState(0);
  const [bettorWon, setBettorWon] = useState(false);
  const [userSide, setUserSide] = useState<"Bettor" | "Bookmaker">("Bettor");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    string | null
  >(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Pull the players array from the currently selected session
  const selectedSessionPlayers =
    sessions.find((session) => session.id === sessionId)?.players || [];

  // Reference to auto-scroll to bottom when new transactions arrive
  const transactionsEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      transactionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [transactions]);

  // If editing a transaction, populate the form fields
  useEffect(() => {
    if (editingTransaction) {
      setTransactionType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      // The first element in our players array is always "user".
      // Then fill in the rest from the transaction’s players (skipping the first?).
      // Adjust as needed so it lines up with how you're storing them.
      setPlayers([user, ...editingTransaction.players.slice(1)]);
      setPayerIndex(editingTransaction.payerIndex);
      setReceiverIndex(editingTransaction.receiverIndex);
      setBettorWon(editingTransaction.bettorWon || false);
      setUserSide(editingTransaction.userSide || "Bettor");
    } else {
      resetForm();
    }
  }, [editingTransaction, user]);

  // Reset form to defaults
  const resetForm = () => {
    setTransactionType("Match");
    setAmount("");
    setPlayers([user, "", "", "", "", ""]);
    setPayerIndex(2);
    setReceiverIndex(0);
    setBettorWon(false);
    setUserSide("Bettor");
  };

  // Marks a transaction as paid/unpaid
  const handleMarkPaidToggle = (
    e: React.MouseEvent<HTMLButtonElement>,
    transaction: Transaction
  ) => {
    e.stopPropagation();
    if (transaction.paid) {
      markTransactionUnpaid(transaction.id, user);
    } else {
      markTransactionPaid(transaction.id, user);
    }
  };


  // Opens form in "Add Transaction" mode
  const openFormForAdd = () => {
    setEditingTransaction(null);
    resetForm();
    setIsFormOpen(true);
  };

  // Opens form in "Edit Transaction" mode
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  // Cancels form editing
  const handleCancelEdit = () => {
    setEditingTransaction(null);
    resetForm();
    setIsFormOpen(false);
  };

  // Expand/collapse transaction details
  const toggleExpanded = (transactionId: string) => {
    setExpandedTransactionId((prev) =>
      prev === transactionId ? null : transactionId
    );
  };

  const handleAddPlayerToSession = (newPlayerName: string) => {
    addPlayerToSession(sessionId, newPlayerName);
  };
  // Determine if user is the "winner" of a transaction
  const userWonTransaction = (t: Transaction): boolean => {
    if (t.type === "Match") {
      return t.players[t.receiverIndex] === user;
    } else {
      return t.userSide === "Bettor" && t.bettorWon === true;
    }
  };

  // Filter transactions by search term
  const filtered = transactions.filter((t) =>
    t.players.some((player) =>
      player.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Split into user wins vs. losses
  const userWins = filtered.filter(userWonTransaction);
  const userLosses = filtered.filter((t) => !userWonTransaction(t));

  // Tally up amounts
  const totalWinsAmount = userWins.reduce((acc, t) => acc + t.amount, 0);
  const totalLossesAmount = userLosses.reduce((acc, t) => acc + t.amount, 0);

  // Simple currency formatter
  const formatCurrency = (value: number) =>
    value.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
      <CardHeader className="bg-gray-50 rounded-t-xl px-6 py-4">
        <CardTitle className="text-2xl font-bold text-gray-800 mb-1">
          Match Manager
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Quickly log and view your Match and Side Bet transactions.
          </div>
          {/* <Button variant="outline" onClick={() => setIsStatsOpen(true)}>
            View Stats
          </Button> */}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="flex flex-1 items-center gap-2 max-w-sm">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <div className="relative w-full">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <Input
                id="search"
                type="text"
                placeholder="Search by player name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
          </div>

          <Button onClick={openFormForAdd} className="flex-shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Match
          </Button>
        </div>

        {/* Transaction Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TransactionList
            title="My Wins"
            transactions={userWins}
            totalAmount={totalWinsAmount}
            expandedTransactionId={expandedTransactionId}
            toggleExpanded={toggleExpanded}
            user={user}
            formatCurrency={formatCurrency}
            handleEdit={handleEdit}
            handleMarkPaidToggle={handleMarkPaidToggle}
            badgeColor="bg-green-100 text-green-800"
          />
          <TransactionList
            title="My Losses"
            transactions={userLosses}
            totalAmount={totalLossesAmount}
            expandedTransactionId={expandedTransactionId}
            toggleExpanded={toggleExpanded}
            user={user}
            formatCurrency={formatCurrency}
            handleEdit={handleEdit}
            handleMarkPaidToggle={handleMarkPaidToggle}
            badgeColor="bg-red-100 text-red-800"
          />
        </div>

        {/* Scroll anchor */}
        <div ref={transactionsEndRef} />
      </CardContent>

      {/* Dialog for Add/Edit Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Match" : "Add Match"}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? "Update the transaction details below."
                : "Fill out the fields to create a new transaction."}
            </DialogDescription>
          </DialogHeader>

          <TransactionForm
            user={user}
            selectedSessionPlayers={selectedSessionPlayers}
            onAddPlayerToSession={handleAddPlayerToSession}
            initialTransactionType={editingTransaction?.type ?? "Match"}
            initialPlayers={
              editingTransaction
                ? [user, ...editingTransaction.players.slice(1)]
                : [user, "", "", "", "", ""]
            }
            initialAmount={
              editingTransaction ? editingTransaction.amount.toString() : ""
            }
            initialPayerIndex={editingTransaction?.payerIndex ?? 2}
            initialReceiverIndex={editingTransaction?.receiverIndex ?? 0}
            initialBettorWon={editingTransaction?.bettorWon ?? false}
            initialUserSide={editingTransaction?.userSide ?? "Bettor"}
            isEditing={Boolean(editingTransaction)}
            // Called when user clicks “Add” or “Update”
            onSubmit={({
              transactionType,
              players,
              amount,
              payerIndex,
              receiverIndex,
              bettorWon,
              userSide,
            }: {
              transactionType: "Match" | "SideBet";
              players: string[];
              amount: string;
              payerIndex: number;
              receiverIndex: number;
              bettorWon: boolean;
              userSide: "Bettor" | "Bookmaker";
            }) => {
              const numericAmount = parseFloat(amount);

              // Basic validation checks
              if (Number.isNaN(numericAmount) || numericAmount < 0) {
                alert("Please enter a valid amount.");
                return;
              }
              // For a Match, ensure payer != winner
              if (transactionType === "Match" && payerIndex === receiverIndex) {
                alert("Winner and Payer must be different people.");
                return;
              }

              if (editingTransaction) {
                // Update existing transaction
                updateTransaction(
                  editingTransaction.id,
                  transactionType,
                  numericAmount,
                  players,
                  payerIndex,
                  receiverIndex,
                  transactionType === "SideBet" ? bettorWon : undefined,
                  transactionType === "SideBet" ? userSide : undefined
                );
                setEditingTransaction(null);
              } else {
                // Add new transaction
                addTransaction(
                  sessionId,
                  transactionType,
                  numericAmount,
                  players,
                  payerIndex,
                  receiverIndex,
                  transactionType === "SideBet" ? bettorWon : undefined,
                  transactionType === "SideBet" ? userSide : undefined
                );
              }

              // Close the dialog after saving
              setIsFormOpen(false);
            }}
            // Called when user clicks “Cancel”
            onCancel={() => {
              setEditingTransaction(null);
              setIsFormOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
      <SessionStatsDialog
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        sessionId={sessionId}
      />
    </Card>
  );
}
