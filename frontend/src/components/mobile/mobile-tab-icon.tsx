"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileTabIconProps {
  icon: LucideIcon;
  active?: boolean;
  label: string;
}

export function MobileTabIcon({ icon: Icon, active, label }: MobileTabIconProps) {
  return (
    <span className="relative flex flex-col items-center justify-center gap-1">
      <span
        className={cn(
          "mobile-tab-icon-wrap",
          active && "mobile-tab-icon-wrap-active"
        )}
        aria-hidden
      >
        <Icon className={cn("h-[22px] w-[22px] transition-transform duration-300", active && "scale-105")} />
      </span>
      <span
        className={cn(
          "text-[10px] font-medium leading-none tracking-tight transition-colors duration-200",
          active ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </span>
  );
}
