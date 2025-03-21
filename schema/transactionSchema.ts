// transactionSchema.ts
import { z } from "zod";

export const transactionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  type: z.enum(["MATCH"]),
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

export type TransactionFormData = z.infer<typeof transactionSchema>;
