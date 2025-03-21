// MatchDetailsFieldset.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FuzzyCreatableSelect from "@/components/FuzzyCreatableSelect";
import { TransactionFormData } from "@/schema/transactionSchema";

interface MatchDetailsFieldsetProps {
  sessionPlayers: string[];
  team1Player1: string;
  team1Player2: string;
  team2Player1: string;
  team2Player2: string;
  errors: {
    team2Player1?: { message?: string };
  };
  addPlayerToSession: (name: string) => void;
  setValue: (
    field: keyof TransactionFormData,
    value: string,
    options?: { shouldValidate?: boolean }
  ) => void;
}

/**
 * Renders the "TEAM 1" and "TEAM 2" fields for match details.
 * No side effects here; all changes are delegated via setValue to parent.
 */
const MatchDetailsFieldset: React.FC<MatchDetailsFieldsetProps> = ({
  sessionPlayers,
  team1Player1,
  team1Player2,
  team2Player1,
  team2Player2,
  errors,
  addPlayerToSession,
  setValue,
}) => {
  return (
    <fieldset className="border p-4 rounded-lg">
      <legend className="text-lg font-medium">Match Details</legend>
      <div className="grid grid-cols-[2fr_1fr_2fr] items-center gap-x-2 w-full">
        {/* TEAM 1 */}
        <div className="space-y-2">
          <Input
            value={team1Player1}
            disabled
            className="bg-gray-100 cursor-not-allowed"
          />
          <FuzzyCreatableSelect
            placeholder="Teammate's name"
            value={team1Player2 || null}
            onChange={(newValue) =>
              setValue("team1Player2", newValue, { shouldValidate: true })
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
              setValue("team2Player1", newValue, { shouldValidate: true })
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
              setValue("team2Player2", newValue, { shouldValidate: true })
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
  );
};

export default MatchDetailsFieldset;
