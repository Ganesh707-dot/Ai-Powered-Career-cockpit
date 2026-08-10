import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendUp = true,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "surface-elevated group relative overflow-hidden p-4 sm:p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                trendUp ? "text-emerald-400" : "text-amber-400"
              )}
            >
              {trendUp ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
