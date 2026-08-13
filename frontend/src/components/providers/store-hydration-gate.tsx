"use client";

import { useEffect } from "react";
import { useWorkspaceSync } from "@/hooks/use-workspace-sync";
import { useJobContextStore } from "@/stores/job-context-store";

/** Show UI immediately — sync workspace in background (faster first paint). */
export function StoreHydrationGate({ children }: { children: React.ReactNode }) {
  useWorkspaceSync();

  useEffect(() => {
    useJobContextStore.getState().bootstrap();
  }, []);

  return <>{children}</>;
}
