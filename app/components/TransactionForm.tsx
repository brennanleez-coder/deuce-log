"use client";

import React, { useState } from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Coins, Trophy, User } from "lucide-react";
import FuzzyCreatableSelect from "@/components/FuzzyCreatableSelect";

interface TransactionFormProps {
  // Required data
  user: string; // The current user’s name
  selectedSessionPlayers: string[]; // Players in the current session
  onAddPlayerToSession: (newPlayerName: string) => void;

  // State & Handlers
  initialTransactionType?: "Match" | "SideBet";
  initialPlayers?: string[]; // e.g. [user, '', '', '', '']
  initialAmount?: string;
  initialPayerIndex?: number;
  initialReceiverIndex?: number;
  initialBettorWon?: boolean;
  initialUserSide?: "Bettor" | "Bookmaker";

  onSubmit: (formData: {
    transactionType: "Match" | "SideBet";
    players: string[];
    amount: string;
    payerIndex: number;
    receiverIndex: number;
    bettorWon: boolean;
    userSide: "Bettor" | "Bookmaker";
  }) => void;
  onCancel: () => void;
  isEditing?: boolean; // If true, the button text = "Update Transaction", else "Add Transaction"
}

export default function TransactionForm({
  user,
  selectedSessionPlayers,
  onAddPlayerToSession,
  initialTransactionType = "Match",
  initialPlayers = [],
  initialAmount = "",
  initialPayerIndex = 2,
  initialReceiverIndex = 0,
  initialBettorWon = false,
  initialUserSide = "Bettor",
  onSubmit,
  onCancel,
  isEditing = false,
}: TransactionFormProps) {
  // Local form state
  const [transactionType, setTransactionType] = useState<"Match" | "SideBet">(
    initialTransactionType
  );
  const [players, setPlayers] = useState<string[]>(initialPlayers);
  const [amount, setAmount] = useState(initialAmount);
  const [payerIndex, setPayerIndex] = useState(initialPayerIndex);
  const [receiverIndex, setReceiverIndex] = useState(initialReceiverIndex);
  const [bettorWon, setBettorWon] = useState(initialBettorWon);
  const [userSide, setUserSide] = useState<"Bettor" | "Bookmaker">(
    initialUserSide
  );

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      transactionType,
      players,
      amount,
      payerIndex,
      receiverIndex,
      bettorWon,
      userSide,
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 mt-4">
      {/* Transaction Type Selector */}
      <RadioGroup
        value={transactionType}
        onValueChange={(value) => setTransactionType(value as "Match" | "SideBet")}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <RadioGroupItem value="Match" id="match" className="peer sr-only" />
          <Label
            htmlFor="match"
            className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 
                       hover:bg-accent peer-data-[state=checked]:border-primary 
                       [&:has([data-state=checked])]:border-primary transition-colors"
          >
            <Trophy className="mb-2 h-6 w-6 text-yellow-600" />
            <span className="font-semibold">Match</span>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="SideBet" id="sideBet" className="peer sr-only" />
          <Label
            htmlFor="sideBet"
            className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 
                       hover:bg-accent peer-data-[state=checked]:border-primary 
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

          {/* Player 1 (You) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Player 1 (You)</Label>
            <Input
              value={user}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Player 2 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Player 2</Label>
            <FuzzyCreatableSelect
              label=""
              value={players[1] || ""}
              onChange={(newVal) => {
                setPlayers([user, newVal, ...players.slice(2)]);
              }}
              sessionPlayers={selectedSessionPlayers}
              onAddPlayer={onAddPlayerToSession}
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

          {/* Player 3 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Player 3</Label>
            <FuzzyCreatableSelect
              label=""
              value={players[2] || ""}
              onChange={(newVal) => {
                const updated = [...players];
                updated[2] = newVal;
                setPlayers(updated);
              }}
              sessionPlayers={selectedSessionPlayers}
              onAddPlayer={onAddPlayerToSession}
              exclude={[user, players[1] ?? ""]}
              placeholder="Select or add Player 3"
            />
          </div>

          {/* Player 4 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Player 4</Label>
            <FuzzyCreatableSelect
              label=""
              value={players[3] || ""}
              onChange={(newVal) => {
                const updated = [...players];
                updated[3] = newVal;
                setPlayers(updated);
              }}
              sessionPlayers={selectedSessionPlayers}
              onAddPlayer={onAddPlayerToSession}
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
              onValueChange={(value) => setUserSide(value as "Bettor" | "Bookmaker")}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bettor" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Bettor
                </SelectItem>
                <SelectItem value="Bookmaker" className="flex items-center gap-2">
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
              label=""
              value={players[4] || ""}
              onChange={(newVal) => {
                // Update players[4] with the selected or newly created name
                setPlayers([...players.slice(0, 4), newVal]);
              }}
              sessionPlayers={selectedSessionPlayers}
              onAddPlayer={onAddPlayerToSession}
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
                  // Exclude the currently-selected payer
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
                  // Exclude the currently-selected winner
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
              onCheckedChange={(checked) => setBettorWon(checked as boolean)}
            />
            <Label htmlFor="bettorWon" className="text-sm font-medium">
              Bettor Won the Wager
            </Label>
          </div>
        </div>
      )}

      <DialogFooter className="mt-6 flex justify-end gap-2">
        <Button type="submit">
          {isEditing ? "Update Transaction" : "Add Match"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </form>
  );
}
