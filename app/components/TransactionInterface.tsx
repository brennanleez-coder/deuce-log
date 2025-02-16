"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trophy, Coins, User, PlusCircle, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Transaction, Session } from "@/types/types";
import FuzzyCreatableSelect from "@/components/FuzzyCreatableSelect";
import TransactionList from "./TransactionList";

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

  // Add or update a transaction
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && players.filter(Boolean).length >= 4) {
      const numericAmount = parseFloat(amount);
      if (Number.isNaN(numericAmount) || numericAmount < 0) return;

      // Ensure winner != payer (Match-specific check)
      if (transactionType === "Match" && receiverIndex === payerIndex) {
        alert("Winner and Payer must be different people.");
        return;
      }

      if (editingTransaction) {
        // Updating an existing transaction
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
        // Adding a new transaction
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
      resetForm();
      setIsFormOpen(false);
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
          Transaction Manager
        </CardTitle>
        <p className="text-sm text-gray-600">
          Quickly log and view your Match and Side Bet transactions.
        </p>
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
            Add Transaction
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? "Update the transaction details below."
                : "Fill out the fields to create a new transaction."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Transaction Type Selector */}
            <RadioGroup
              value={transactionType}
              onValueChange={(value) =>
                setTransactionType(value as "Match" | "SideBet")
              }
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="Match"
                  id="match"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="match"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary 
                  [&:has([data-state=checked])]:border-primary transition-colors"
                >
                  <Trophy className="mb-2 h-6 w-6 text-yellow-600" />
                  <span className="font-semibold">Match</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="SideBet"
                  id="sideBet"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="sideBet"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary 
                  [&:has([data-state=checked])]:border-primary transition-colors"
                >
                  <Coins className="mb-2 h-6 w-6 text-emerald-600" />
                  <span className="font-semibold">Side Bet</span>
                </Label>
              </div>
            </RadioGroup>

            {/* Player fields */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* YOUR PAIR */}
              <fieldset className="space-y-3 rounded-lg border p-4">
                <legend className="px-2 text-sm font-medium text-gray-700">
                  Your Pair
                </legend>
                <div className="space-y-2">
                  {/* Player 1 (You) */}
                  <Input
                    value={user}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />

                  {/* Player 2 (Select from session players, excluding you) */}
                  <FuzzyCreatableSelect
                    label="Player 2"
                    value={players[1] || ""}
                    onChange={(newVal) => {
                      setPlayers([user, newVal, ...players.slice(2)]);
                    }}
                    sessionPlayers={selectedSessionPlayers}
                    onAddPlayer={handleAddPlayerToSession}
                    exclude={[user]}
                    placeholder="Select or add Player 2"
                  />
                </div>
              </fieldset>

              {/* OPPONENT PAIR */}
              <fieldset className="space-y-3 rounded-lg border p-4">
                <legend className="px-2 text-sm font-medium text-gray-700">
                  Opponent Pair
                </legend>
                <div className="space-y-2">
                  {/* Player 3 */}
                  <FuzzyCreatableSelect
                    label="Player 3"
                    value={players[2] || ""}
                    onChange={(newVal) => {
                      const updated = [...players];
                      updated[2] = newVal;
                      setPlayers(updated);
                    }}
                    sessionPlayers={selectedSessionPlayers}
                    onAddPlayer={handleAddPlayerToSession}
                    exclude={[user, players[1] ?? ""]}
                    placeholder="Select or add Player 3"
                  />

                  {/* Player 4 */}
                  <FuzzyCreatableSelect
                    label="Player 4"
                    value={players[3] || ""}
                    onChange={(newVal) => {
                      const updated = [...players];
                      updated[3] = newVal;
                      setPlayers(updated);
                    }}
                    sessionPlayers={selectedSessionPlayers}
                    onAddPlayer={handleAddPlayerToSession}
                    exclude={[user, players[1] ?? "", players[2] ?? ""]}
                    placeholder="Select or add Player 4"
                  />
                </div>
              </fieldset>
            </div>

            {/* SideBet options */}
            {transactionType === "SideBet" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Your Role</Label>
                  <Select
                    value={userSide}
                    onValueChange={(value) =>
                      setUserSide(value as "Bettor" | "Bookmaker")
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* In your original code, 'Bookmaker' is never enabled.
                          Adjust as desired: */}
                      <SelectItem
                        value="Bettor"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Bettor
                      </SelectItem>
                      <SelectItem
                        value="Bookmaker"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Bookmaker
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {userSide === "Bettor" ? "Bookmaker Name" : "Bettor Name"}
                  </Label>
                  <FuzzyCreatableSelect
                    label="" // We already have a <Label> above
                    value={players[4] || ""}
                    onChange={(newVal) => {
                      // Update players[4] with the selected or newly created name
                      setPlayers([...players.slice(0, 4), newVal]);
                    }}
                    sessionPlayers={selectedSessionPlayers}
                    onAddPlayer={handleAddPlayerToSession}
                    // Optionally exclude existing players so they cannot be selected again:
                    // exclude={[user, players[1], players[2], players[3]]}
                    placeholder={
                      userSide === "Bettor"
                        ? "Enter Bookmaker name"
                        : "Enter Bettor name"
                    }
                  />
                </div>
              </div>
            )}

            {/* Amount field */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pl-8"
                />
              </div>
            </div>

            {/* Match-specific fields */}
            {transactionType === "Match" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Winning Person</Label>
                  <Select
                    value={receiverIndex.toString()}
                    onValueChange={(value) => setReceiverIndex(Number(value))}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select winner" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.slice(0, 4).map((p, idx) => {
                        if (!p) return null;
                        // EXCLUDE the currently-selected payer
                        if (idx === payerIndex) return null;
                        return (
                          <SelectItem key={idx} value={idx.toString()}>
                            {idx < 2 ? `Team 1: ${p}` : `Team 2: ${p}`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Paying Person</Label>
                  <Select
                    value={payerIndex.toString()}
                    onValueChange={(value) => setPayerIndex(Number(value))}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select payer" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.slice(0, 4).map((p, idx) => {
                        if (!p) return null;
                        // EXCLUDE the currently-selected winner
                        if (idx === receiverIndex) return null;
                        return (
                          <SelectItem key={idx} value={idx.toString()}>
                            {idx < 2 ? `Team 1: ${p}` : `Team 2: ${p}`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* SideBet-specific fields */}
            {transactionType === "SideBet" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center space-x-3 p-4 rounded-lg border bg-white">
                  <Checkbox
                    id="bettorWon"
                    checked={bettorWon}
                    onCheckedChange={(checked) =>
                      setBettorWon(checked as boolean)
                    }
                  />
                  <Label htmlFor="bettorWon" className="text-sm font-medium">
                    Bettor Won the Wager
                  </Label>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button type="submit">
                {editingTransaction ? "Update Transaction" : "Add Transaction"}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
