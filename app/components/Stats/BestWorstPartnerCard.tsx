import * as React from "react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
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
  // Define the explanation dynamically
  let explanation = "";

  if (label?.includes("Partner")) {
    explanation = `
    - This is determined by your win ratio when playing together.
    - Win Ratio = Wins ÷ (Wins + Losses)
    - The best partners have the highest win ratio.
    - The worst partners have the lowest win ratio.
    - If two partners have the same win ratio, the one with more total games played is prioritized.
    `;
  } else {
    explanation = `
    - This is based on your head-to-head match history.
    - Win Ratio = Wins ÷ (Wins + Losses)
    - Toughest opponents have beaten you more times than you've beaten them.
    - Most defeated opponents are the ones you've beaten more than they've beaten you.
    - If multiple opponents have the same win count, the one with more matches played is prioritized.
    `;
  }

  return (
    <Card
      className={cn(
        "flex flex-col items-center text-center p-4 shadow-sm border rounded-lg space-y-2 h-full",
        className
      )}
    >
      {icon && <div className="mb-1">{icon}</div>}
      <p className="text-lg font-semibold">{name}</p>
      {label && <p className="text-sm text-gray-500">{label}</p>}

      <p className="text-md font-medium text-gray-700">
        {wins}W / {losses}L
      </p>

      {/* Small Popup Dialog for Explanation */}
      {/* <div className="flex items-center justify-center flex-grow min-h-[40px]">
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-xs text-blue-500 hover:underline flex items-center gap-1">
              <Info className="w-4 h-4" />
              How is this calculated?
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-4">
            <DialogHeader>
              <DialogTitle className="text-md font-semibold text-gray-800">
                Calculation Method
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {explanation}
            </p>
          </DialogContent>
        </Dialog>
      </div> */}
    </Card>
  );
}
