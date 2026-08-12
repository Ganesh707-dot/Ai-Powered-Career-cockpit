"use client";

import { useEffect, useState } from "react";

/**
 * Avoid Zustand persist hydration mismatch — render children only after
 * localStorage state has rehydrated on the client.
 */
export function StoreHydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-[100dvh] app-mesh flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
