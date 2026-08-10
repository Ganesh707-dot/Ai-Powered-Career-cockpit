"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BANNER_KEY = "careerpilot-setup-banner-dismissed";

export function SetupBanner() {
  const profile = useProfileStore();
  const openProfile = useUIStore((s) => s.openProfile);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const state = useProfileStore.getState();
    if (state.isReady() || state.onboardingDone) return;
    setDismissed(localStorage.getItem(BANNER_KEY) === "1");
  }, []);

  if (profile.isReady() || profile.onboardingDone || dismissed) {
    return null;
  }

  const dismiss = () => {
    localStorage.setItem(BANNER_KEY, "1");
    setDismissed(true);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-primary/20",
        "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent",
        "animate-in slide-in-from-top-2 fade-in duration-500"
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3 lg:px-6">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">
            Set up your profile for smarter job matches
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
            Add skills & salary prefs — works on phone and laptop. No popup blocking you.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" className="h-9 rounded-lg" onClick={openProfile}>
              Set up profile
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 text-muted-foreground rounded-lg"
              onClick={dismiss}
            >
              Later
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background/50 text-muted-foreground transition-colors hover:bg-background active:scale-95"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
