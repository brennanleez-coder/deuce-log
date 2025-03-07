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
import Loader from "@/components/FullScreenLoader";
import { toast } from "sonner";
import { useBadmintonSessions } from "@/hooks/useBadmintonSessions";

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
            bettor: transaction.bettor || name, // Default bettor to the logged-in user
            bookmaker: transaction.bookmaker || "",
            bettorWon: transaction.bettorWon ?? false, // Ensure boolean default
            winningTeam:
              transaction.receiver === transaction.team1[0] ? "team1" : "team2", // ✅ Fixed
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
            winningTeam: "team2",
          },
  });

  const [loading, setLoading] = useState(false);
  const { sessions: allSessions, isLoading: sessionsLoading } = useBadmintonSessions();

  const [session, setSession] = useState<any>(null);
  const [sessionPlayers, setSessionPlayers] = useState<string[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [isFriendly, setIsFriendly] = useState(false);
  const transactionType = watch("type");
  const winningTeam = watch("winningTeam");

  // Watch the team player fields
  const team1Player1 = watch("team1Player1");
  const team2Player1 = watch("team2Player1");

  const payer = watch("payer");
  const receiver = watch("receiver");

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
    if (!userId || !sessionId || sessionsLoading) return;

    // Find the required session (if needed)
    const requiredSession = allSessions.find((s: any) => s.id === sessionId);
    setSession(requiredSession);

    // Instead of making a separate axios call,
    // deduplicate players from all sessions available via the hook.
    const dedupePlayers = Array.from(
      new Set(allSessions.flatMap((s: any) => s.players || []))
    );
    setSessionPlayers(dedupePlayers);
  }, [userId, sessionId, allSessions, sessionsLoading]);

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
      toast.error("Failed to add player to session.");
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
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === "string") data[key] = data[key].trim();
    });
    const payload = {
      sessionId,
      userId,
      ...data,
      ...(data.type === "MATCH" && {
        team1: [data.team1Player1, data.team1Player2].filter(Boolean),
        team2: [data.team2Player1, data.team2Player2].filter(Boolean),
      }),
    };
    console.log("payload", payload);
    try {
      await onSubmit(payload);
    } catch (error: any) {
      toast.error("Failed to add match.");
    } finally {
      setLoading(false);
    }
  };

  // if (playersLoading) return <Loader />;
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
        </RadioGroup>
      </div>

      {transactionType === "MATCH" && (
        <>
        {playersLoading? (
          <Loader />
        )
        :(  <fieldset className="border p-4 rounded-lg">
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
              <div className="text-center">
                <p className="text-xl font-bold">VS</p>
              </div>
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
)}

        
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Payer (Loser)
              </Label>
              <Select
                value={payer}
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
                value={receiver}
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
          // defaultValue={0}
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
