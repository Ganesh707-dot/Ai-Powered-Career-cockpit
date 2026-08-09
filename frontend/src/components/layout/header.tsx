"use client";

import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileSheet } from "./profile-sheet";
import { useProfileStore } from "@/stores/profile-store";

const pageTitles: Record<string, string> = {
  "/": "Executive Dashboard",
  "/jobs": "Job Search Workspace",
  "/jd-analysis": "JD Intelligence",
  "/interview-prep": "Interview Prep",
  "/hr-studio": "HR Answer Studio",
  "/mentor": "AI Career Staff",
  "/ai-coach": "AI Coach",
  "/journal": "Interview Journal",
  "/resumes": "Resume Intelligence",
  "/learning": "Learning Path",
  "/analytics": "Analytics",
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "CareerPilot AI";
  const profile = useProfileStore();
  const ready = profile.isReady();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight truncate">{title}</h2>
        {ready ? (
          <p className="text-[11px] text-muted-foreground truncate">
            Personalized for {profile.targetRole}
            {profile.skillsList().length > 0
              ? ` · ${profile.skillsList().slice(0, 3).join(", ")}`
              : ""}
          </p>
        ) : (
          <p className="text-[11px] text-amber-400">
            Set your profile once — every AI feature uses it
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <ProfileSheet />
        <Button asChild size="sm">
          <Link href="/jobs">
            <Plus className="h-4 w-4" />
            New Application
          </Link>
        </Button>
      </div>
    </header>
  );
}
