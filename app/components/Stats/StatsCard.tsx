"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/magicui/number-ticker";

interface StatsCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  valueClassName?: string;
  buttonLabel?: string;
  onToggle?: () => void;
}

export default function StatsCard({
  icon,
  value,
  label,
  valueClassName = "",
  buttonLabel,
  onToggle,
}: StatsCardProps) {
  const renderValue = () => {
    if (typeof value === "number") {
      return (
        <div className={`mt-2 text-xl sm:text-2xl font-bold ${valueClassName}`}>
          <NumberTicker
            value={value}
            duration={1500}
            format={(num: number) =>
              Number.isInteger(num)
                ? num.toLocaleString()
                : num.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
            }
          />
        </div>
      );
    } else if (typeof value === "string") {
      const winLossRegex = /^(\d+)W\s*\/\s*(\d+)L$/;
      const match = value.match(winLossRegex);
      if (match) {
        const winCount = parseInt(match[1], 10);
        const lossCount = parseInt(match[2], 10);
        return (
          <div
            className={`text-xl sm:text-2xl font-bold ${valueClassName} flex items-center justify-center gap-x-3`}
          >
            <NumberTicker value={winCount} duration={1500} />
            <span className="text-sm text-gray-500"> /</span>
            <NumberTicker value={lossCount} duration={1500} />
          </div>
        );
      }
      return (
        <p className={`text-lg font-semibold mt-2 ${valueClassName}`}>
          {value}
        </p>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col justify-between items-center text-center p-4 shadow-sm border rounded-xl h-full min-h-[140px] sm:min-h-[160px] min-w-[140px] sm:min-w-[160px] transition-all duration-200 hover:shadow-md bg-white">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-10 h-10 flex items-center justify-center text-slate-700 rounded-full shadow-sm">
          {icon}
        </div>
        {renderValue()}
        <p className="text-xs sm:text-sm text-muted-foreground font-medium tracking-wide">
          {label}
        </p>
      </div>

      {buttonLabel && onToggle && (
        <Button
          variant="outline"
          className="mt-4 w-full text-[11px] sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
          onClick={onToggle}
        >
          {buttonLabel}
        </Button>
      )}
    </Card>
  );
}
