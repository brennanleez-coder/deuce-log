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
        <div className={`mt-2 ${valueClassName}`}>
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
      // Check if value matches the pattern "digitsW / digitsL"
      const winLossRegex = /^(\d+)W\s*\/\s*(\d+)L$/;
      const match = value.match(winLossRegex);
      if (match) {
        const winCount = parseInt(match[1], 10);
        const lossCount = parseInt(match[2], 10);
        return (
          <div className={`mt-2 ${valueClassName} flex items-center space-x-1`}>
            <NumberTicker
              value={winCount}
              duration={1500}
              format={(num: number) => num.toLocaleString()}
            />
            <span>W /</span>
            <NumberTicker
              value={lossCount}
              duration={1500}
              format={(num: number) => num.toLocaleString()}
            />
            <span>L</span>
          </div>
        );
      }
      // Fallback: display string value as text
      return (
        <p className={`text-lg font-semibold mt-2 ${valueClassName}`}>
          {value}
        </p>
      );
    }
    return null;
  };
  return (
    <Card className="flex flex-col justify-between items-center text-center p-4 shadow-sm border rounded-lg h-full min-h-[140px] sm:min-h-[160px] min-w-[120px] sm:min-w-[140px]">
      <div className="flex flex-col items-center">
        {icon}
        {renderValue()}
        <p className="text-sm text-gray-500">{label}</p>
      </div>

      {buttonLabel && onToggle && (
        <Button
          variant="outline"
          className="mt-4 w-full text-[10px] md:text-sm px-2 py-1 sm:px-3 sm:py-2 leading-tight sm:leading-normal"
          onClick={onToggle}
        >
          {buttonLabel}
        </Button>
      )}
    </Card>
  );
}
