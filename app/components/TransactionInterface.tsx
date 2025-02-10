"use client";

import { useState, useEffect, useRef } from "react";
import type { Transaction } from "../../hooks/useMatchTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Trophy,
  Edit,
  Coins,
  User,
  Banknote,
  Save,
  PlusCircle,
  Search,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface TransactionInterfaceProps {
  user: string;
  sessionId: string;
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
  transactions: Transaction[];
}

export default function TransactionInterface({
  user,
  sessionId,
  addTransaction,
  updateTransaction,
  transactions,
  markTransactionPaid,
}: TransactionInterfaceProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [transactionType, setTransactionType] = useState<"Match" | "SideBet">(
    "Match"
  );
  const [amount, setAmount] = useState(""); // <--- controlled input for amount
  const [players, setPlayers] = useState<string[]>([user, "", "", "", "", ""]);
  const [payerIndex, setPayerIndex] = useState(2);
  const [receiverIndex, setReceiverIndex] = useState(0);
  const [bettorWon, setBettorWon] = useState(false);
  const [userSide, setUserSide] = useState<"Bettor" | "Bookmaker">("Bettor");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // For filtering / searching the transaction list
  const [searchTerm, setSearchTerm] = useState("");

  // Track which transaction is expanded
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);

  const transactionsEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll logic
  useEffect(() => {
    if (transactions.length > 0) {
      transactionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [transactions]);

  // Load existing transaction data into form states if editing
  useEffect(() => {
    if (editingTransaction) {
      setTransactionType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString()); // Convert number to string
      // Copy the existing players, but ensure the first one is always the current user
      setPlayers([user, ...editingTransaction.players.slice(1)]);
      setPayerIndex(editingTransaction.payerIndex);
      setReceiverIndex(editingTransaction.receiverIndex);
      setBettorWon(editingTransaction.bettorWon || false);
      setUserSide(editingTransaction.userSide || "Bettor");
    } else {
      resetForm();
    }
  }, [editingTransaction, user]);

  // Reset form states
  const resetForm = () => {
    setTransactionType("Match");
    setAmount("");
    setPlayers([user, "", "", "", "", ""]);
    setPayerIndex(2);
    setReceiverIndex(0);
    setBettorWon(false);
    setUserSide("Bettor");
  };

  // On submit: either update or add transaction
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Example validation: require 4 non-empty players & a non-empty amount
    if (amount && players.filter(Boolean).length >= 4) {
      const numericAmount = Number.parseFloat(amount); // Convert string to number

      if (editingTransaction) {
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

      // Close the form & reset
      resetForm();
      setIsFormOpen(false);
    }
  };

  // Open the modal form for a new transaction
  const openFormForAdd = () => {
    setEditingTransaction(null);
    resetForm();
    setIsFormOpen(true);
  };

  // Click to edit an existing transaction
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTransaction(null);
    resetForm();
    setIsFormOpen(false);
  };

  // Expand/collapse a transaction card
  const toggleExpanded = (transactionId: string) => {
    setExpandedTransactionId((prev) => (prev === transactionId ? null : transactionId));
  };

  // Utility to check if user "won" a transaction
  const userWonTransaction = (t: Transaction): boolean => {
    if (t.type === "Match") {
      return t.players[t.receiverIndex] === user;
    } else {
      // SideBet
      return t.userSide === "Bettor" && t.bettorWon === true;
    }
  };

  // Filter transactions based on searchTerm (by player names)
  const filtered = transactions.filter((t) =>
    t.players.some((player) =>
      player.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Split into wins vs losses
  const userWins = filtered.filter((t) => userWonTransaction(t));
  const userLosses = filtered.filter((t) => !userWonTransaction(t));

  // Compute total amounts
  const totalWinsAmount = userWins.reduce((acc, t) => acc + t.amount, 0);
  const totalLossesAmount = userLosses.reduce((acc, t) => acc + t.amount, 0);

  return (
    <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
      <CardHeader className="bg-gray-50 rounded-t-xl">
        <CardTitle className="text-xl font-bold text-gray-800">
          Transaction Manager
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="flex items-center justify-between gap-x-2">
          {/* Search / Filter */}
          <div className="flex items-center gap-2 my-4 w-full">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <div className="relative flex-1">
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

          {/* Add Transaction button */}
          <div className="flex items-center justify-end">
            <Button onClick={openFormForAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Two-column layout: Wins on the left, Losses on the right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: My Wins */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                My Wins ({userWins.length})
              </h3>
              {/* Show total dollar amount of wins */}
              <span className="text-sm font-medium text-green-600">
                {totalWinsAmount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </span>
            </div>

            <div className="space-y-3">
              {userWins.map((transaction) => {
                const isExpanded = expandedTransactionId === transaction.id;
                const bookmakerName =
                  transaction.type === "SideBet"
                    ? transaction.players[4] ?? "N/A"
                    : "";

                return (
                  <Card
                    key={transaction.id}
                    className="border-gray-200 hover:border-blue-200 transition-colors group"
                  >
                    {/* Clickable preview row */}
                    <div
                      onClick={() => toggleExpanded(transaction.id)}
                      className="cursor-pointer p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                    >
                      <div className="flex items-center space-x-2 font-semibold text-gray-700">
                        <span>
                          {transaction.players[0]} & {transaction.players[1]}
                        </span>
                        <span className="text-sm text-gray-400">VS</span>
                        <span>
                          {transaction.players[2]} & {transaction.players[3]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Show a chip for Match or SideBet */}
                        {transaction.type === "Match" ? (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                            Side Bet vs. {bookmakerName}
                          </span>
                        )}

                        {/* Since these are all wins, we can just say "You Won" */}
                        <span className="text-xs text-green-600 font-semibold">
                          You Won
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <CardContent className="p-4 border-t">
                        {/* Amount + Time */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">
                            {new Date(
                              transaction.timestamp
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <div className="text-lg font-semibold text-green-600">
                            {transaction.amount.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </div>
                        </div>

                        {/* 2v2 Layout */}
                        {transaction.type === "Match" ? (
                          <MatchLayout transaction={transaction} user={user} />
                        ) : (
                          <SideBetLayout transaction={transaction} user={user} />
                        )}

                        {/* Actions */}
                        <div className="mt-4 flex items-center gap-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(transaction);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 px-0"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Transaction
                          </Button>
                          {transaction.paid ? (
                            <div className="inline-block text-sm text-green-600">
                              Paid
                            </div>
                          ) : (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                markTransactionPaid(transaction.id, user);
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right: My Losses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                My Losses ({userLosses.length})
              </h3>
              {/* Show total dollar amount of losses */}
              <span className="text-sm font-medium text-red-600">
                {totalLossesAmount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </span>
            </div>

            <div className="space-y-3">
              {userLosses.map((transaction) => {
                const isExpanded = expandedTransactionId === transaction.id;
                const bookmakerName =
                  transaction.type === "SideBet"
                    ? transaction.players[4] ?? "N/A"
                    : "";

                return (
                  <Card
                    key={transaction.id}
                    className="border-gray-200 hover:border-blue-200 transition-colors group"
                  >
                    {/* Clickable preview row */}
                    <div
                      onClick={() => toggleExpanded(transaction.id)}
                      className="cursor-pointer p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                    >
                      <div className="flex items-center space-x-2 font-semibold text-gray-700">
                        <span>
                          {transaction.players[0]} & {transaction.players[1]}
                        </span>
                        <span className="text-sm text-gray-400">VS</span>
                        <span>
                          {transaction.players[2]} & {transaction.players[3]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Show a chip for Match or SideBet */}
                        {transaction.type === "Match" ? (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                            Side Bet vs. {bookmakerName}
                          </span>
                        )}

                        {/* Loss */}
                        <span className="text-xs text-red-600 font-semibold">
                          You Lost
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <CardContent className="p-4 border-t">
                        {/* Amount + Time */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">
                            {new Date(
                              transaction.timestamp
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <div className="text-lg font-semibold text-red-600">
                            {transaction.amount.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </div>
                        </div>

                        {/* 2v2 Layout */}
                        {transaction.type === "Match" ? (
                          <MatchLayout transaction={transaction} user={user} />
                        ) : (
                          <SideBetLayout transaction={transaction} user={user} />
                        )}

                        {/* Actions */}
                        <div className="mt-4 flex items-center gap-4">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(transaction);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 px-0"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Transaction
                          </Button>
                          {transaction.paid ? (
                            <div className="inline-block text-sm text-green-600">
                              Paid
                            </div>
                          ) : (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                markTransactionPaid(transaction.id, user);
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <div ref={transactionsEndRef} />
      </CardContent>

      {/* ============= Dialog for Add/Edit Form ============= */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? "Update the transaction details."
                : "Fill out the form to add a new transaction."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Transaction type radio group */}
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
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
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
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
                >
                  <Coins className="mb-2 h-6 w-6 text-emerald-600" />
                  <span className="font-semibold">Side Bet</span>
                </Label>
              </div>
            </RadioGroup>

            {/* Player fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <fieldset className="space-y-3 rounded-lg border p-4">
                <legend className="px-2 text-sm font-medium text-gray-700">
                  Your Pair
                </legend>
                <div className="space-y-2">
                  <Input
                    value={user}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <Input
                    value={players[1]}
                    onChange={(e) =>
                      setPlayers([user, e.target.value, ...players.slice(2)])
                    }
                    placeholder="Player 2"
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-3 rounded-lg border p-4">
                <legend className="px-2 text-sm font-medium text-gray-700">
                  Opponent Pair
                </legend>
                <div className="space-y-2">
                  <Input
                    value={players[2]}
                    onChange={(e) =>
                      setPlayers([
                        ...players.slice(0, 2),
                        e.target.value,
                        players[3],
                        ...players.slice(4),
                      ])
                    }
                    placeholder="Player 3"
                  />
                  <Input
                    value={players[3]}
                    onChange={(e) =>
                      setPlayers([
                        ...players.slice(0, 3),
                        e.target.value,
                        ...players.slice(4),
                      ])
                    }
                    placeholder="Player 4"
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
                      {/* Example: only Bettor is selectable */}
                      <SelectItem disabled value="Bettor">
                        <User className="mr-2 h-4 w-4" />
                        Bettor
                      </SelectItem>
                      {/* If you want 'Bookmaker' selectable, remove 'disabled' */}
                      {/* <SelectItem value="Bookmaker">
                        <Banknote className="mr-2 h-4 w-4" />
                        Bookmaker
                      </SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {userSide === "Bettor" ? "Bookmaker Name" : "Bettor Name"}
                  </Label>
                  <Input
                    value={players[4]}
                    onChange={(e) =>
                      setPlayers([...players.slice(0, 4), e.target.value])
                    }
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
                      <SelectValue placeholder="Select winners" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.slice(0, 4).map(
                        (p, idx) =>
                          p && (
                            <SelectItem key={idx} value={idx.toString()}>
                              {idx < 2 ? `Team 1: ${p}` : `Team 2: ${p}`}
                            </SelectItem>
                          )
                      )}
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
                      <SelectValue placeholder="Select payers" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.slice(0, 4).map(
                        (p, idx) =>
                          p && (
                            <SelectItem key={idx} value={idx.toString()}>
                              {idx < 2 ? `Team 1: ${p}` : `Team 2: ${p}`}
                            </SelectItem>
                          )
                      )}
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

/** 
 * MatchLayout and SideBetLayout remain the same.
 * They simply display 2v2 players plus extra info 
 * and do not store local state for editing. 
 */
function MatchLayout({
  transaction,
  user,
}: {
  transaction: Transaction;
  user: string;
}) {
  const winningTeam = transaction.receiverIndex < 2 ? 1 : 2;

  return (
    <div className="flex items-center justify-between">
      {/* Team 1 */}
      <div
        className={`flex flex-col items-center p-4 border rounded-lg w-5/12 ${
          winningTeam === 1 ? "bg-green-100 border-green-500" : "bg-white"
        }`}
      >
        <div className="font-semibold text-gray-800">Team 1</div>
        <div className="text-sm text-gray-600 flex flex-col justify-center items-center">
          {transaction.players.slice(0, 2).map((player, i) => (
            <p key={i}>{player}</p>
          ))}
        </div>
      </div>

      {/* VS */}
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold text-gray-700">VS</span>
      </div>

      {/* Team 2 */}
      <div
        className={`flex flex-col items-center p-4 border rounded-lg w-5/12 ${
          winningTeam === 2 ? "bg-green-100 border-green-500" : "bg-white"
        }`}
      >
        <div className="font-semibold text-gray-800">Team 2</div>
        <div className="text-sm text-gray-600 flex flex-col justify-center items-center">
          {transaction.players.slice(2, 4).map((player, i) => (
            <p key={i}>{player}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function SideBetLayout({
  transaction,
  user,
}: {
  transaction: Transaction;
  user: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center p-4 border rounded-lg w-5/12">
          <div className="font-semibold text-gray-800">Team 1</div>
          <div className="text-sm text-gray-600 flex flex-col justify-center items-center">
            {transaction.players.slice(0, 2).map((player, i) => (
              <p key={i}>{player}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-gray-700">VS</span>
        </div>
        <div className="flex flex-col items-center p-4 border rounded-lg w-5/12">
          <div className="font-semibold text-gray-800">Team 2</div>
          <div className="text-sm text-gray-600 flex flex-col justify-center items-center">
            {transaction.players.slice(2, 4).map((player, i) => (
              <p key={i}>{player}</p>
            ))}
          </div>
        </div>
      </div>
      {/* SideBet extra details */}
      <div className="space-y-2 text-sm mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-gray-500">Bettor</div>
            <div className="font-medium">{transaction.players[0]}</div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-500">Bookmaker</div>
            <div className="font-medium">{transaction.players[4]}</div>
          </div>
        </div>
        <div className="pt-2 text-sm border-t">
          <span className="text-gray-500">Outcome: </span>
          <span className="font-medium">
            {transaction.bettorWon ? "You Won" : `${transaction.players[4]} Won`}{" "}
            •{" "}
            <span className="text-blue-600">
              Your Side: {transaction.userSide}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
