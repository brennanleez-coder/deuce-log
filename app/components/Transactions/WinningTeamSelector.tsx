// WinningTeamSelector.tsx
"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TransactionFormData } from "@/schema/transactionSchema";

/** 
 * Props for winning team selector 
 */
interface WinningTeamSelectorProps {
  winningTeam: TransactionFormData["winningTeam"];
  errorMessage?: string;
  onChange: (team: "team1" | "team2") => void;
}

/**
 * Renders "Did you win the match?" radio buttons.
 */
const WinningTeamSelector: React.FC<WinningTeamSelectorProps> = ({
  winningTeam,
  onChange,
  errorMessage,
}) => {
  return (
    <div className="flex flex-col w-full gap-2">
      <Label className="text-sm font-medium text-left w-full">
        Did you win the match?
      </Label>
      <RadioGroup
        value={winningTeam}
        onValueChange={(value) => onChange(value as "team1" | "team2")}
        className="flex w-full gap-4"
      >
        <div className="w-full">
          <RadioGroupItem value="team1" id="won" className="hidden" />
          <Label
            htmlFor="won"
            onClick={() => onChange("team1")}
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
            onClick={() => onChange("team2")}
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
      {errorMessage && (
        <p className="text-red-500 text-xs">{errorMessage}</p>
      )}
    </div>
  );
};

export default WinningTeamSelector;
