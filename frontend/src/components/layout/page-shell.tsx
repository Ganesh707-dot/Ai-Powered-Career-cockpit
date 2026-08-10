import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  /** Wider layout for dashboards */
  wide?: boolean;
}

export function PageShell({ children, className, wide }: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full space-y-6 sm:space-y-8",
        wide ? "max-w-[1600px]" : "max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
}
