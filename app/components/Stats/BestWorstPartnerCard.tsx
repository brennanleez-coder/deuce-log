// PartnerCard.tsx
import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type PartnerCardProps = {
  name?: string;
  label?: string;
  wins?: number;
  losses?: number;
  icon?: React.ReactNode;
  className?: string;
};

export default function BestWorstPartnerCard({
  name = "N/A",
  label,
  wins = 0,
  losses = 0,
  icon,
  className,
}: PartnerCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center text-center p-4 shadow-sm border rounded-lg",
        className
      )}
    >
      {icon && <div className="mb-1">{icon}</div>}

      <p className="text-lg font-semibold mt-1">{name}</p>

      {label && (
        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
          {label}

          {/* Tooltip Trigger + Content */}
          <Tooltip>
            <TooltipTrigger asChild>
              {/* The icon you hover over to see the explanation */}
              <Info className="w-4 h-4 cursor-pointer text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="p-3 md:p-4 text-xs md:text-sm leading-relaxed text-center max-w-xs md:max-w-sm">
              <p className="mb-1">
                The <strong>best</strong> and <strong>worst</strong> partners
                are determined based on your win ratio with each partner.
              </p>
              <p className="mb-1">
                <strong>Win Ratio</strong> is calculated as:
                <br />
                <span className="font-medium">wins ÷ (wins + losses)</span>
              </p>
              <p>
                Your{" "}
                <span className="text-green-600 font-semibold">
                  best partners {" "}
                </span>
                have the highest win ratios, while
                <span className="text-red-600 font-semibold">
                  {" "}
                  worst partners
                </span>{" "}
                have the lowest.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      <p className="text-md font-medium text-gray-700 mt-1">
        {wins}W / {losses}L
      </p>
    </Card>
  );
}
