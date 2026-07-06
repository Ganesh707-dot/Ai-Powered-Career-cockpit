import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";
import { STATUS_COLORS } from "@/types";

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors =
    STATUS_COLORS[status as ApplicationStatus] ||
    "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        colors,
        className
      )}
    >
      {status}
    </span>
  );
}
