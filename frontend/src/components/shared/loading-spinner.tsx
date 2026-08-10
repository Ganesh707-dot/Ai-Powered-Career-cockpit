import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({
  className,
  size = "md",
  label = "Loading",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 py-12", className)}
      role="status"
      aria-label={label}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      <span className="text-xs text-muted-foreground sr-only">{label}</span>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading page">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-[420px] rounded-xl lg:col-span-3" />
        <Skeleton className="h-[420px] rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-32 rounded-xl", className)} />;
}
