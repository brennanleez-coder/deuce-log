// PayerReceiverSection.tsx
"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { TransactionFormData } from "@/schema/transactionSchema";

/**
 * Props for payer/receiver section
 */
interface PayerReceiverSectionProps {
  payer: string;
  receiver: string;
  payerOptions: string[];
  receiverOptions: string[];
  setValue: (
    field: keyof TransactionFormData,
    value: string,
    options?: { shouldValidate?: boolean }
  ) => void;
}

/**
 * Renders the Payer (loser) and Receiver (winner) selects.
 */
const PayerReceiverSection: React.FC<PayerReceiverSectionProps> = ({
  payer,
  receiver,
  payerOptions,
  receiverOptions,
  setValue,
}) => {
  return (
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
  );
};

export default PayerReceiverSection;
