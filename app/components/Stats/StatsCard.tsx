"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  return (
    <Card className="flex flex-col justify-between items-center text-center p-4 shadow-sm border rounded-lg h-full min-h-[140px] sm:min-h-[160px] min-w-[120px] sm:min-w-[140px]">
      <div className="flex flex-col items-center">
        {icon}
        <p className={`text-lg font-semibold mt-2 ${valueClassName}`}>
          {value}
        </p>
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
