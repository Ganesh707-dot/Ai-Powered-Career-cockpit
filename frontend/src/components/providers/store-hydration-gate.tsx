"use client";

import { useEffect, useState } from "react";
import { useWorkspaceSync } from "@/hooks/use-workspace-sync";
import { useJobContextStore } from "@/stores/job-context-store";

/**
 * Non-blocking hydration — show UI immediately, sync workspace in background.
 */
export function StoreHydrationGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useWorkspaceSync();

  useEffect(() => {
    setMounted(true);
    useJobContextStore.getState().bootstrap();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
