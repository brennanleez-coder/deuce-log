"use client";

import React, { useState } from "react";
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
import { DollarSign, Trophy, User, Users, Coins } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Transaction } from "@/types/types";
import axios from "axios";
import FuzzyCreatableSelect from "@/components/FuzzyCreatableSelect";
import { BadmintonSession } from "@prisma/client";
import FullScreenLoader from "@/components/FullScreenLoader";
// Create a type alias from the zod schema
const transactionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  type: z.enum(["MATCH", "SIDEBET"]),
  amount: z.number().min(1, "Amount must be greater than 0"),
  team1Player1: z.string().min(1, "Team 1 must have at least one member"),
  team1Player2: z.string().optional(),
  team2Player1: z.string().min(1, "Team 2 must have at least one member"),
  team2Player2: z.string().optional(),
  payer: z.string().optional(),
  receiver: z.string().optional(),
  bettor: z.string().optional(),
  bookmaker: z.string().optional(),
  bettorWon: z.boolean().optional(),
  // Allow empty string as default, but require non-empty on validation.
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
            bettor: transaction.bettor || name, // Default bettor to the logged-in user
            bookmaker: transaction.bookmaker || "",
            bettorWon: transaction.bettorWon ?? false, // Ensure boolean default
            winningTeam:
              transaction.payer === transaction.team1[0] ? "team2" : "team1",
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
            winningTeam: undefined,
          },
  });

  const [loading, setLoading] = useState(false);
  const [session,setSession] = useState<any>(null);
  const [sessionPlayers, setSessionPlayers] = useState<string[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const transactionType = watch("type");
  const winningTeam = watch("winningTeam");

  // Update payer/receiver when winningTeam changes.
  React.useEffect(() => {
    if (winningTeam) {
      if (winningTeam === "team1") {
        // If Team 1 wins, set payer as Team 2's player1 and receiver as Team 1's player1.
        setValue("payer", getValues("team2Player1"), { shouldValidate: true });
        setValue("receiver", getValues("team1Player1"), {
          shouldValidate: true,
        });
      } else {
        // If Team 2 wins, set payer as Team 1's player1 and receiver as Team 2's player1.
        setValue("payer", getValues("team1Player1"), { shouldValidate: true });
        setValue("receiver", getValues("team2Player1"), {
          shouldValidate: true,
        });
      }
    }
  }, [winningTeam, setValue, getValues]);

  React.useEffect(() => {
    if (!userId || !sessionId) return;

    const fetchAllPlayers = async () => {
      try {
        setPlayersLoading(true); // start loading
        // Example: fetch all sessions for the user
        const { data: allSessions } = await axios.get("/api/badminton-sessions", {
          params: { userId },
        });
        // Find the relevant session
        const requiredSession = allSessions.find((s: any) => s.id === sessionId);
        if (!requiredSession) {
          console.warn("Session not found for this userId and sessionId.");
          setPlayersLoading(false);
          return;
        }
        setSession(requiredSession);
        
        const allTimeSessionPlayers = allSessions.flatMap((s: BadmintonSession) => s.players);
        const dedupePlayers = Array.from(new Set(allTimeSessionPlayers));
        setSessionPlayers(dedupePlayers);
        // We'll use the array of players from that session
   
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setPlayersLoading(false); // done loading
      }
    };

    fetchAllPlayers();
  }, [userId, sessionId]);


  const addPlayerToSession = async (newPlayerName: string) => {
    try {
      const updated = [...sessionPlayers, newPlayerName];

      await axios.put(`/api/badminton-sessions/${sessionId}`, {
        name: session?.name,
        courtFee: session?.courtFee,
        players: updated,
      });

      setSessionPlayers(updated); // local state
    } catch (error) {
      console.error("Error adding player:", error);
      alert("Failed to add player. Check console for details.");
    }
  };

  const handleFormSubmit = async (data: TransactionFormData) => {
    if (!userId)
      return console.error("User ID is required to add a transaction");
    setLoading(true);
    const payload = {
      sessionId,
      userId,
      ...data,
      // Combine match fields into arrays only if type is MATCH.
      ...(data.type === "MATCH" && {
        team1: [data.team1Player1, data.team1Player2].filter(Boolean),
        team2: [data.team2Player1, data.team2Player2].filter(Boolean),
      }),
    };
    try {
      await onSubmit(payload);
    } catch (error: any) {
      console.error(
        "Error creating transaction:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  if (playersLoading) return <FullScreenLoader/>;
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 mt-4">
      {/* Transaction Type */}
      <div className="space-y-2">
        <RadioGroup
          value={transactionType}
          onValueChange={(value) =>
            setValue("type", value, { shouldValidate: true })
          }
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem value="MATCH" id="match" className="peer sr-only" />
            <Label
              htmlFor="match"
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-primary transition-colors"
            >
              <Trophy className="w-6 h-6 text-primary mb-1" />
              Match
            </Label>
          </div>
          {/* <div>
            <RadioGroupItem value="SIDEBET" id="sidebet" className="peer sr-only" />
            <Label
              htmlFor="sidebet"
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-primary transition-colors"
            >
              <Coins className="w-6 h-6 text-primary mb-1" />
              Side Bet
            </Label>
          </div> */}
        </RadioGroup>
      </div>

      {/* Amount Field */}
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

      {transactionType === "MATCH" && (
        <>
          {/* Team Fields in 2v2 Format with VS */}
          <fieldset className="border p-4 rounded-lg">
            <legend className="text-lg font-medium flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" /> Match Details
            </legend>
            <div className="grid grid-cols-[2fr_1fr_2fr] items-center w-full">
              {/* Team 1 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Team 1</Label>
                <Input
                  {...register("team1Player1")}
                  value={name}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <FuzzyCreatableSelect
                  placeholder="Teammate's name"
                  value={watch("team1Player2") || null}
                  onChange={(newValue) =>
                    setValue("team1Player2", newValue, { shouldValidate: true })
                  }
                  sessionPlayers={sessionPlayers}
                  onAddPlayer={addPlayerToSession}
                  exclude={[name]}
                />
              </div>
              {/* VS Column */}
              <div className="text-center">
                <p className="text-xl font-bold">VS</p>
              </div>
              {/* Team 2 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Team 2</Label>

                <FuzzyCreatableSelect
                  placeholder="Opponent's name"
                  value={watch("team2Player1") || null}
                  onChange={(newValue) =>
                    setValue("team2Player1", newValue, { shouldValidate: true })
                  }
                  sessionPlayers={sessionPlayers}
                  onAddPlayer={addPlayerToSession}
                  exclude={[name]}

                />
                <FuzzyCreatableSelect
                  placeholder="Opponent's name"
                  value={watch("team2Player2") || null}
                  onChange={(newValue) =>
                    setValue("team2Player2", newValue, { shouldValidate: true })
                  }
                  sessionPlayers={sessionPlayers}
                  onAddPlayer={addPlayerToSession}
                  exclude={[name]}

                />
              </div>
            </div>
          </fieldset>

          {/* Winning Team Radio Group */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Winning Team</Label>
            <RadioGroup
              value={winningTeam || ""}
              onValueChange={(value) =>
                setValue("winningTeam", value, { shouldValidate: true })
              }
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="team1"
                  id="winTeam1"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="winTeam1"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-primary transition-colors"
                >
                  <span className="text-sm font-medium">Team 1 Wins</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="team2"
                  id="winTeam2"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="winTeam2"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-primary transition-colors"
                >
                  <span className="text-sm font-medium">Team 2 Wins</span>
                </Label>
              </div>
            </RadioGroup>
            {errors.winningTeam && (
              <p className="text-red-500 text-xs">
                {errors.winningTeam.message}
              </p>
            )}
          </div>

          {/* Payer & Receiver Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Payer (Loser)
              </Label>
              <Select
                value={watch("payer") || "unassigned"}
                onValueChange={(value) => setValue("payer", value)}
              >
                <SelectTrigger className="bg-red-100 border border-red-500">
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    winningTeam === "team1"
                      ? getValues("team2Player1")
                      : getValues("team1Player1"),
                  ]
                    .filter(Boolean)
                    .map((player) => (
                      <SelectItem key={player} value={player}>
                        {player}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Receiver (Winner)
              </Label>
              <Select
                value={watch("receiver") || "unassigned"}
                onValueChange={(value) => setValue("receiver", value)}
              >
                <SelectTrigger className="bg-green-100 border border-green-500">
                  <SelectValue placeholder="Select receiver" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    winningTeam === "team1"
                      ? getValues("team1Player1")
                      : getValues("team2Player1"),
                  ]
                    .filter(
                      (player) => Boolean(player) && player !== watch("payer")
                    )
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

      {transactionType === "SIDEBET" && (
        <>
          {/* Sidebet Details */}
          <fieldset className="border p-4 rounded-lg">
            <legend className="text-lg font-medium flex items-center gap-2">
              Sidebet Details
            </legend>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bettor</Label>
              <Input
                {...register("bettor")}
                value={name}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bookmaker</Label>
              <Input
                {...register("bookmaker")}
                placeholder="Enter bookmaker's name"
              />
              {errors.bookmaker && (
                <p className="text-red-500">{errors.bookmaker.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Did the Bettor Win?</Label>
              <RadioGroup
                value={watch("bettorWon") ? "yes" : "no"}
                onValueChange={(value) =>
                  setValue("bettorWon", value === "yes", {
                    shouldValidate: true,
                  })
                }
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="yes"
                    id="bettorWonYes"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="bettorWonYes"
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-primary transition-colors"
                  >
                    <span className="text-sm font-medium">Yes</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="no"
                    id="bettorWonNo"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="bettorWonNo"
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-primary transition-colors"
                  >
                    <span className="text-sm font-medium">No</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </fieldset>
        </>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="outline" disabled={loading}>
          {isEditing ? "Update Match" : "Add Match"}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
