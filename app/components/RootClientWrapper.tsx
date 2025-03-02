"use client";

import { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";


export default function RootClientWrapper({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      {children}
    </TooltipProvider>
  );
}
