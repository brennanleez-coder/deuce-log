// TransactionForm.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DollarSign, Trophy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Loader from "@/components/FullScreenLoader";
import { toast } from "sonner";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";

import { transactionSchema, TransactionFormData } from "@/schema/transactionSchema";
import { Transaction } from "@/types/types";

import MatchDetailsFieldset from "./MatchDetailsFieldSet";
import WinningTeamSelector from "./WinningTeamSelector";
import PayerReceiverSection from "./PayerReceiverSection";

interface TransactionFormProps {
  userId: string;
  name: string;
  sessionId: string;
  onSubmit: (transaction: Transaction) => void;
  transaction?: Transaction | null;
  isEditing?: boolean;
}

const TransactionForm = ({
  userId,
  name,
  sessionId,
  onSubmit,
  transaction = null,
  isEditing = false,
}: TransactionFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      isEditing && transaction
        ? {
            sessionId,
            type: transaction.type,
            amount: transaction.amount,
            team1Player1: transaction.team1[0] || "",
            team1Player2: transaction.team1[1] || "",
            team2Player1: transaction.team2[0] || "",
            team2Player2: transaction.team2[1] || "",
            payer: transaction.payer || "",
            receiver: transaction.receiver || "",
            bettor: transaction.bettor || name,
            bookmaker: transaction.bookmaker || "",
            bettorWon: transaction.bettorWon ?? false,
            winningTeam:
              transaction.receiver &&
              transaction.team1.includes(transaction.receiver)
                ? "team1"
                : "team2",
          }
        : {
            sessionId,
            type: "MATCH",
            amount: 0,
            team1Player1: name,
            team1Player2: "",
            team2Player1: "",
            team2Player2: "",
            payer: "",
            receiver: "",
            bettor: name,
            bookmaker: "",
            bettorWon: false,
            winningTeam: "",
          },
  });

  const [loading, setLoading] = useState(false);
  const { sessions: allSessions, isLoading: sessionsLoading } = useBadmintonSessions();
  const [session, setSession] = useState<any>(null);
  const [sessionPlayers, setSessionPlayers] = useState<string[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);

  // Watch relevant fields
  const transactionType = watch("type");
  const winningTeam = watch("winningTeam");
  const team1Player1 = watch("team1Player1");
  const team1Player2 = watch("team1Player2");
  const team2Player1 = watch("team2Player1");
  const team2Player2 = watch("team2Player2");
  const payer = watch("payer");
  const receiver = watch("receiver");

  // Calculate payer/receiver options based on winningTeam
  const payerOptions = useMemo(() => {
    if (transactionType !== "MATCH") return [];
    if (winningTeam === "team1") {
      // team2 is losing
      return [team2Player1, team2Player2].filter(Boolean);
    } else if (winningTeam === "team2") {
      // team1 is losing
      return [team1Player1, team1Player2].filter(Boolean);
    }
    return [];
  }, [
    transactionType,
    winningTeam,
    team1Player1,
    team1Player2,
    team2Player1,
    team2Player2,
  ]);

  const receiverOptions = useMemo(() => {
    if (transactionType !== "MATCH") return [];
    if (winningTeam === "team1") {
      // team1 is winning
      return [team1Player1, team1Player2].filter(Boolean);
    } else if (winningTeam === "team2") {
      // team2 is winning
      return [team2Player1, team2Player2].filter(Boolean);
    }
    return [];
  }, [
    transactionType,
    winningTeam,
    team1Player1,
    team1Player2,
    team2Player1,
    team2Player2,
  ]);

  // Ensure payer/receiver remain valid if teams or winningTeam change
  useEffect(() => {
    if (transactionType === "MATCH" && winningTeam) {
      // If the current payer is not in new payerOptions, default to first
      if (payerOptions.length > 0 && !payerOptions.includes(payer)) {
        setValue("payer", payerOptions[0]);
      }
      // If the current receiver is not in new receiverOptions, default to first
      if (receiverOptions.length > 0 && !receiverOptions.includes(receiver)) {
        setValue("receiver", receiverOptions[0]);
      }
    }
  }, [
    winningTeam,
    team1Player1,
    team1Player2,
    team2Player1,
    team2Player2,
    payerOptions,
    receiverOptions,
    payer,
    receiver,
    transactionType,
    setValue,
  ]);

  // Load session players
  useEffect(() => {
    if (!userId || !sessionId || sessionsLoading) return;
    setPlayersLoading(true);
    const requiredSession = allSessions.find((s: any) => s.id === sessionId);
    setSession(requiredSession);

    // Deduplicate across all sessions (or if you just want the current session, change logic here)
    const dedupePlayers = Array.from(
      new Set(allSessions.flatMap((s: any) => s.players || []))
    );
    setSessionPlayers(dedupePlayers);
    setPlayersLoading(false);
  }, [userId, sessionId, allSessions, sessionsLoading]);

  const addPlayerToSession = async (newPlayerName: string) => {
    try {
      const updated = [...sessionPlayers, newPlayerName];
      await axios.put(`/api/badminton-sessions/${sessionId}`, {
        name: session?.name,
        courtFee: session?.courtFee,
        players: updated,
      });
      setSessionPlayers(updated);
    } catch (error) {
      console.error("Error adding player:", error);
      toast.error("Failed to add player to session.");
    }
  };

  const handleWinningTeamChange = (team: "team1" | "team2") => {
    setValue("winningTeam", team, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: TransactionFormData) => {
    if (!userId) {
      console.error("User ID is required to add a transaction");
      return;
    }
    setLoading(true);

    // Trim strings
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === "string") {
        data[key] = data[key].trim() as any;
      }
    });

    const payload: Partial<Transaction> = {
      sessionId,
      userId,
      ...data,
      ...(data.type === "MATCH" && {
        team1: [data.team1Player1, data.team1Player2].filter(Boolean),
        team2: [data.team2Player1, data.team2Player2].filter(Boolean),
      }),
    };

    try {
      await onSubmit(payload as Transaction);
    } catch (error: any) {
      toast.error("Failed to add match.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 p-4 max-h-[90vh] overflow-y-auto"
    >
      <div className="w-full">
        <RadioGroup
          value={transactionType}
          onValueChange={(value) => setValue("type", value as "MATCH", { shouldValidate: true })}
          className="grid gap-4 w-full"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          }}
        >
          <div className="w-full">
            <RadioGroupItem value="MATCH" id="match" className="peer sr-only" />
            <Label
              htmlFor="match"
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-primary transition-colors"
            >
              <Trophy className="w-6 h-6 text-primary mb-1" />
              Match
            </Label>
          </div>
        </RadioGroup>
      </div>

      {playersLoading ? (
        <Loader />
      ) : (
        <>
          {/* 1) Match Details Fieldset */}
          <MatchDetailsFieldset
            sessionPlayers={sessionPlayers}
            team1Player1={team1Player1}
            team1Player2={team1Player2}
            team2Player1={team2Player1}
            team2Player2={team2Player2}
            errors={{
              team2Player1: errors.team2Player1,
            }}
            addPlayerToSession={addPlayerToSession}
            setValue={setValue}
          />

          {/* 2) Winning Team Selector */}
          <WinningTeamSelector
            winningTeam={winningTeam}
            onChange={handleWinningTeamChange}
            errorMessage={errors.winningTeam?.message}
          />

          {/* 3) Payer / Receiver */}
          <PayerReceiverSection
            payer={payer}
            receiver={receiver}
            payerOptions={payerOptions}
            receiverOptions={receiverOptions}
            setValue={setValue}
          />
        </>
      )}

      {/* AMOUNT */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" /> Amount ($)
        </Label>
        <Input
          type="number"
          {...register("amount", { valueAsNumber: true })}
          placeholder="Enter amount"
        />
        {errors.amount && (
          <p className="text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="outline" disabled={loading}>
          {isEditing ? "Update Match" : "Add Match"}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
