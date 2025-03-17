"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Trophy, User, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Transaction } from "@/types/types";
import axios from "axios";
import FuzzyCreatableSelect from "@/components/FuzzyCreatableSelect";
import Loader from "@/components/FullScreenLoader";
import { toast } from "sonner";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";
import SideBetsPopover from "./MatchSideBetForm";

const transactionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  type: z.enum(["MATCH", "SIDEBET"]),
  amount: z.number().min(0, "Amount must be at least 0"),
  team1Player1: z.string().min(1, "Team 1 must have at least one member"),
  team1Player2: z.string().optional(),
  team2Player1: z.string().min(1, "Team 2 must have at least one member"),
  team2Player2: z.string().optional(),
  payer: z.string().optional(),
  receiver: z.string().optional(),
  bettor: z.string().optional(),
  bookmaker: z.string().optional(),
  bettorWon: z.boolean().optional(),
  winningTeam: z
    .union([z.enum(["team1", "team2"]), z.literal("")])
    .refine((val) => val !== "", { message: "Please select a winning team" }),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

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
    getValues,
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
              // If needed, you can refine how you decide which "team" won
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
  const { sessions: allSessions, isLoading: sessionsLoading } =
    useBadmintonSessions();

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

  // Get losing-team options for payer, winning-team options for receiver.
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

  // Whenever winningTeam or one of the team players changes,
  // ensure "payer" & "receiver" remain valid (or set a default).
  useEffect(() => {
    if (transactionType === "MATCH" && winningTeam) {
      // If the current payer is not in the new payerOptions, default to first
      if (payerOptions.length > 0 && !payerOptions.includes(payer)) {
        setValue("payer", payerOptions[0]);
      }
      // If the current receiver is not in the new receiverOptions, default to first
      if (receiverOptions.length > 0 && !receiverOptions.includes(receiver)) {
        setValue("receiver", receiverOptions[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    winningTeam,
    team1Player1,
    team1Player2,
    team2Player1,
    team2Player2,
    payerOptions,
    receiverOptions,
  ]);

  useEffect(() => {
    if (!userId || !sessionId || sessionsLoading) return;
    setPlayersLoading(true);
    const requiredSession = allSessions.find((s: any) => s.id === sessionId);
    setSession(requiredSession);

    const dedupePlayers = Array.from(
      new Set(allSessions.flatMap((s: any) => s.players || []))
    );
    setSessionPlayers(dedupePlayers);
    setPlayersLoading(false);
  }, [userId, sessionId, allSessions, sessionsLoading]);

  // Optional: if you want a default initial payer/receiver when NOT editing,
  // you can do so here. This is up to your business logic.
  // (You might not need this if your useEffect above handles defaults properly.)

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
      if (typeof data[key] === "string") data[key] = data[key].trim();
    });

    const payload: Partial<Transaction> = {
      sessionId,
      userId,
      ...data,
      ...(data.type === "MATCH" && {
        // for the final transaction, assemble the team arrays
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
          onValueChange={(value) =>
            setValue("type", value as "MATCH" | "SIDEBET", {
              shouldValidate: true,
            })
          }
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
          {/* If you plan to allow "SIDEBET", you'd add a second radio option here */}
        </RadioGroup>
      </div>

      {transactionType === "MATCH" && (
        <>
          {playersLoading ? (
            <Loader />
          ) : (
            <>
              <fieldset className="border p-4 rounded-lg">
                <legend className="text-lg font-medium flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" /> Match Details
                </legend>
                <div className="grid grid-cols-[2fr_1fr_2fr] items-center gap-x-2 w-full">
                  {/* TEAM 1 */}
                  <div className="space-y-2">
                    <Input
                      {...register("team1Player1")}
                      value={team1Player1}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                    <FuzzyCreatableSelect
                      placeholder="Teammate's name"
                      value={team1Player2 || null}
                      onChange={(newValue) =>
                        setValue("team1Player2", newValue, {
                          shouldValidate: true,
                        })
                      }
                      sessionPlayers={sessionPlayers}
                      onAddPlayer={addPlayerToSession}
                      exclude={[
                        team1Player1,
                        team1Player2,
                        team2Player1,
                        team2Player2,
                      ]}
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-bold">VS</p>
                  </div>

                  {/* TEAM 2 */}
                  <div className="space-y-2">
                    <FuzzyCreatableSelect
                      placeholder="Opponent's name"
                      value={team2Player1 || null}
                      onChange={(newValue) =>
                        setValue("team2Player1", newValue, {
                          shouldValidate: true,
                        })
                      }
                      sessionPlayers={sessionPlayers}
                      onAddPlayer={addPlayerToSession}
                      exclude={[
                        team1Player1,
                        team1Player2,
                        team2Player1,
                        team2Player2,
                      ]}
                    />
                    {errors.team2Player1 && (
                      <p className="text-red-500 text-xs">
                        {errors.team2Player1.message}
                      </p>
                    )}
                    <FuzzyCreatableSelect
                      placeholder="Opponent's name"
                      value={team2Player2 || null}
                      onChange={(newValue) =>
                        setValue("team2Player2", newValue, {
                          shouldValidate: true,
                        })
                      }
                      sessionPlayers={sessionPlayers}
                      onAddPlayer={addPlayerToSession}
                      exclude={[
                        team1Player1,
                        team1Player2,
                        team2Player1,
                        team2Player2,
                      ]}
                    />
                  </div>
                </div>
              </fieldset>
            </>
          )}

          {/* WINNING TEAM */}
          <div className="flex flex-col w-full gap-2">
            <Label className="text-sm font-medium text-left w-full">
              Did you win the match?
            </Label>
            <RadioGroup
              value={winningTeam}
              onValueChange={handleWinningTeamChange}
              className="flex w-full gap-4"
            >
              <div className="w-full">
                <RadioGroupItem value="team1" id="won" className="hidden" />
                <Label
                  htmlFor="won"
                  onClick={() => handleWinningTeamChange("team1")}
                  className={`flex items-center justify-center w-full h-10 border-2 rounded-lg cursor-pointer transition
                    ${
                      winningTeam === "team1"
                        ? "bg-blue-500 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-200"
                    }`}
                >
                  Yes
                </Label>
              </div>

              <div className="w-full">
                <RadioGroupItem value="team2" id="lost" className="hidden" />
                <Label
                  htmlFor="lost"
                  onClick={() => handleWinningTeamChange("team2")}
                  className={`flex items-center justify-center w-full h-10 border-2 rounded-lg cursor-pointer transition
                    ${
                      winningTeam === "team2"
                        ? "bg-red-500 text-white border-red-600"
                        : "border-gray-300 hover:bg-gray-200"
                    }`}
                >
                  No
                </Label>
              </div>
            </RadioGroup>
            {errors.winningTeam && (
              <p className="text-red-500 text-xs">
                {errors.winningTeam.message}
              </p>
            )}
          </div>

          {/* PAYER / RECEIVER SELECTS */}
          <div className="grid grid-cols-2 gap-4">
            {/* PAYER (Losing Team) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Payer (Loser)
              </Label>
              <Select
                value={payer || ""}
                onValueChange={(value) => setValue("payer", value)}
              >
                <SelectTrigger className="bg-red-100 border border-red-500">
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent>
                  {payerOptions.map((player) => (
                    <SelectItem key={player} value={player}>
                      {player}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RECEIVER (Winning Team) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Receiver (Winner)
              </Label>
              <Select
                value={receiver || ""}
                onValueChange={(value) => setValue("receiver", value)}
              >
                <SelectTrigger className="bg-green-100 border border-green-500">
                  <SelectValue placeholder="Select receiver" />
                </SelectTrigger>
                <SelectContent>
                  {receiverOptions
                    .filter((player) => player !== payer)
                    .map((player) => (
                      <SelectItem key={player} value={player}>
                        {player}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
