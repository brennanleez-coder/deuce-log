import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        "flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm space-y-2",
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div className="bg-muted p-2 rounded-full flex items-center justify-center">
          {icon}
        </div>
      )}

      {/* Name */}
      <p className="text-base font-semibold text-foreground">{name}</p>

      {/* Label */}
      {label && (
        <p className="text-xs text-muted-foreground">{label}</p>
      )}

      {/* Win / Loss */}
      <p className="text-sm font-medium text-primary/80">
        <span className="text-primary">{wins}W</span>
        <span className="mx-1 text-muted-foreground">/</span>
        <span className="text-destructive/60">{losses}L</span>
      </p>
    </Card>
  );
}
