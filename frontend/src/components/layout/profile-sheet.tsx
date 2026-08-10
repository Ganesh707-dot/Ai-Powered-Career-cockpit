"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function initials(name: string, role: string) {
  if (name.trim()) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return role.slice(0, 2).toUpperCase();
}

/** No modals — profile is always a normal page at /profile */
export function ProfileSheetProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useProfileSheet() {
  return { openProfile: () => undefined };
}

export function ProfileSheetTrigger({ className }: { className?: string }) {
  const profile = useProfileStore();

  return (
    <>
      <Link
        href="/profile"
        className={cn("xl:hidden mobile-avatar-btn", className)}
        aria-label="Profile setup (optional)"
      >
        <Avatar className="h-9 w-9 border border-border/60">
          <AvatarFallback className="bg-muted text-xs font-semibold">
            {initials(profile.displayName, profile.targetRole)}
          </AvatarFallback>
        </Avatar>
      </Link>

      <Button
        variant="outline"
        size="sm"
        asChild
        className={cn("hidden xl:inline-flex gap-1.5 text-sm rounded-lg min-h-9", className)}
      >
        <Link href="/profile">
          <UserRound className="h-4 w-4" />
          <span className="max-w-[120px] truncate">
            {profile.displayName || "Profile"}
          </span>
        </Link>
      </Button>
    </>
  );
}

/** @deprecated */
export function ProfileSheet() {
  return <ProfileSheetTrigger />;
}
