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
import Loader from "@/components/FullScreenLoader";

const transactionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  type: z.enum(["MATCH", "SIDEBET"]),
  amount: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .min(0, "Amount must be at least 0"),
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
            amount: "",
            team1Player1: name,
            team1Player2: "",
            team2Player1: "",
            team2Player2: "",
            payer: "",
            receiver: "",
            bettor: name,
            bookmaker: "",
            bettorWon: false,
            winningTeam: "team2",
          },
  });

  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [sessionPlayers, setSessionPlayers] = useState<string[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [isFriendly, setIsFriendly] = useState(false);
  const transactionType = watch("type");
  const winningTeam = watch("winningTeam");

  // Watch the team player fields
  const team1Player1 = watch("team1Player1");
  const team2Player1 = watch("team2Player1");

  React.useEffect(() => {
    if (winningTeam) {
      if (winningTeam === "team1") {
        // If Team 1 wins, set payer as Team 2's player1 and receiver as Team 1's player1.
        setValue("payer", team2Player1, { shouldValidate: true });
        setValue("receiver", team1Player1, { shouldValidate: true });
      } else {
        setValue("payer", team1Player1, { shouldValidate: true });
        setValue("receiver", team2Player1, { shouldValidate: true });
      }
    }
  }, [winningTeam, team1Player1, team2Player1, setValue]);
  React.useEffect(() => {
    if (!userId || !sessionId) return;

    const fetchAllPlayers = async () => {
      try {
        setPlayersLoading(true); // start loading
        // Example: fetch all sessions for the user
        const { data: allSessions } = await axios.get(
          "/api/badminton-sessions",
          {
            params: { userId },
          }
        );
        // Find the relevant session
        const requiredSession = allSessions.find(
          (s: any) => s.id === sessionId
        );
        if (!requiredSession) {
          console.warn("Session not found for this userId and sessionId.");
          setPlayersLoading(false);
          return;
        }
        setSession(requiredSession);

        const allTimeSessionPlayers = allSessions.flatMap(
          (s: BadmintonSession) => s.players
        );
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

  React.useEffect(() => {
    if (transaction?.amount === 0 && transaction?.type === "MATCH") {
      // Only set this once at the beginning
      setIsFriendly(true);
    }
    // Either leave dependency array empty (for once on mount)
    // or put `[transaction]` if 'transaction' is fetched asynchronously.
  }, []);

  // 2) Another effect: whenever isFriendly = true, set amount = 0
  React.useEffect(() => {
    if (isFriendly) {
      setValue("amount", 0, { shouldValidate: true });
    }
  }, [isFriendly, setValue]);

  React.useEffect(() => {
    if (!isEditing && sessionPlayers.length) {
      setValue("payer", sessionPlayers[2], { shouldValidate: true });
      setValue("receiver", sessionPlayers[0], { shouldValidate: true });
    }
  }, [isEditing, sessionPlayers, setValue]);

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

  const handleWinningTeamChange = (team: "team1" | "team2") => {
    setValue("winningTeam", team, { shouldValidate: true });
    setValue(
      "payer",
      team === "team1" ? getValues("team2Player1") : getValues("team1Player1"),
      { shouldValidate: true }
    );
    setValue(
      "receiver",
      team === "team1" ? getValues("team1Player1") : getValues("team2Player1"),
      { shouldValidate: true }
    );
  };

  const handleFormSubmit = async (data: TransactionFormData) => {
    if (!userId)
      return console.error("User ID is required to add a transaction");
    setLoading(true);
    // trim all data
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === "string") data[key] = data[key].trim();
    });
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

  if (playersLoading) return <Loader />;
  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 p-4 max-h-[90vh] overflow-y-auto"
    >
      {/* Transaction Type */}
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
        </RadioGroup>
      </div>

      {transactionType === "MATCH" && (
        <>
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
                  exclude={[
                    name,
                    watch("team1Player1"),
                    watch("team2Player1"),
                    watch("team2Player2"),
                  ]}
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
                  exclude={[
                    name,
                    watch("team1Player1"),
                    watch("team2Player1"),
                    watch("team2Player2"),
                  ]}
                />
                <FuzzyCreatableSelect
                  placeholder="Opponent's name"
                  value={watch("team2Player2") || null}
                  onChange={(newValue) =>
                    setValue("team2Player2", newValue, { shouldValidate: true })
                  }
                  sessionPlayers={sessionPlayers}
                  onAddPlayer={addPlayerToSession}
                  exclude={[
                    name,
                    watch("team1Player1"),
                    watch("team2Player1"),
                    watch("team2Player2"),
                  ]}
                />
              </div>
            </div>
          </fieldset>

          <div className="flex justify-between items-center w-full gap-4">
            <div className="flex flex-col w-1/2 space-y-2">
              <Label className="text-sm font-medium">
                Did you win the match?
              </Label>
              <RadioGroup
                value={winningTeam}
                onValueChange={handleWinningTeamChange}
                className="flex gap-4"
              >
                <RadioGroupItem value="team1" id="won" />
                <Label htmlFor="won" className="cursor-pointer">
                  Yes
                </Label>

                <RadioGroupItem value="team2" id="lost" />
                <Label htmlFor="lost" className="cursor-pointer">
                  No
                </Label>
              </RadioGroup>
              {errors.winningTeam && (
                <p className="text-red-500 text-xs">
                  {errors.winningTeam.message}
                </p>
              )}
            </div>

            <div className="flex flex-col w-1/2">
              <Label className="text-sm font-medium">Friendly Match?</Label>
              <RadioGroup
                value={isFriendly ? "yes" : "no"}
                onValueChange={(value) => {
                  setIsFriendly(value === "yes");
                  setValue(
                    "amount",
                    value === "yes" ? 0 : getValues("amount"),
                    { shouldValidate: true }
                  );
                }}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="friendly-yes" />
                  <Label htmlFor="friendly-yes" className="cursor-pointer">
                    Yes
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="friendly-no" />
                  <Label htmlFor="friendly-no" className="cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>
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
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" /> Amount ($)
        </Label>
        <Input
          type="number"
          defaultValue={0}
          {...register("amount", { valueAsNumber: true })}
          placeholder="Enter amount"
          disabled={isFriendly}
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
