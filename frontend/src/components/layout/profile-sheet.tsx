"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { useProfileForm } from "@/hooks/use-profile-form";
import { DESKTOP_MEDIA } from "@/lib/viewport";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/stores/profile-store";

type ProfileSheetContextValue = {
  openProfile: () => void;
};

const ProfileSheetContext = createContext<ProfileSheetContextValue>({
  openProfile: () => undefined,
});

export function useProfileSheet() {
  return useContext(ProfileSheetContext);
}

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

/** Desktop-only modal — mobile/tablet use /profile page (no popup). */
export function ProfileSheetProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const form = useProfileForm();

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MEDIA);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const openProfile = () => {
    if (isDesktop) setOpen(true);
    else router.push("/profile");
  };

  const save = () => {
    form.save();
    setOpen(false);
  };

  return (
    <ProfileSheetContext.Provider value={{ openProfile }}>
      {children}

      {isDesktop && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 max-h-[85vh] min-h-0 xl:p-6 xl:gap-4">
            <DialogHeader className="shrink-0 px-4 pt-4 xl:px-0 xl:pt-0">
              <DialogTitle>Career profile & job prefs</DialogTitle>
              <DialogDescription>
                Optional — Job Mentor chat also builds your profile from conversation.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
              <ProfileEditor
                {...form}
                onSave={save}
                onClose={() => setOpen(false)}
                variant="sheet"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </ProfileSheetContext.Provider>
  );
}

export function ProfileSheetTrigger({ className }: { className?: string }) {
  const profile = useProfileStore();
  const { openProfile } = useProfileSheet();

  return (
    <>
      {/* Mobile & tablet: link to full page — never a popup */}
      <Link
        href="/profile"
        className={cn("xl:hidden mobile-avatar-btn", className)}
        aria-label="Profile setup"
      >
        <Avatar className="h-9 w-9 border border-border/60">
          <AvatarFallback className="bg-muted text-xs font-semibold">
            {initials(profile.displayName, profile.targetRole)}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Desktop: optional modal */}
      <Button
        variant="outline"
        size="sm"
        onClick={openProfile}
        className={cn("hidden xl:inline-flex gap-1.5 text-sm rounded-lg min-h-9", className)}
      >
        <UserRound className="h-4 w-4" />
        <span className="max-w-[120px] truncate">
          {profile.displayName || "Profile"}
        </span>
      </Button>
    </>
  );
}

/** @deprecated use ProfileSheetProvider + ProfileSheetTrigger */
export function ProfileSheet() {
  return <ProfileSheetTrigger />;
}
