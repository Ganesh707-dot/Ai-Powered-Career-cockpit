"use client";

import { useEffect, useState } from "react";
import { useWorkspaceSync } from "@/hooks/use-workspace-sync";
import { useJobContextStore } from "@/stores/job-context-store";

/**
 * Wait for client mount, then hydrate profile + job context from Postgres API.
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
      <div className="min-h-[100dvh] app-mesh flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
