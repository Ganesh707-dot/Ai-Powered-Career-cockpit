"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { UserRound, Save } from "lucide-react";
import { api } from "@/lib/api";
import {
  useProfileStore,
  AI_ASSIST_LABELS,
  type AiAssistLevel,
  type JobPortal,
  type WorkModePref,
} from "@/stores/profile-store";
import { PORTAL_META } from "@/lib/job-portals";
import type { Resume, ResumeListResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetBottomHeader } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ALL_PORTALS = Object.keys(PORTAL_META) as JobPortal[];

type ProfileSheetContextValue = {
  openProfile: () => void;
};

const ProfileSheetContext = createContext<ProfileSheetContextValue>({
  openProfile: () => undefined,
});

export function useProfileSheet() {
  return useContext(ProfileSheetContext);
};

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

function ProfileEditor({
  tab,
  setTab,
  draft,
  setDraft,
  profile,
  resumes,
  loadResume,
  togglePortalDraft,
  onSave,
  onClose,
}: {
  tab: "profile" | "prefs";
  setTab: (t: "profile" | "prefs") => void;
  draft: {
    displayName: string;
    currentLevel: string;
    targetRole: string;
    yearsExperience: number;
    skills: string;
    minSalaryLPA: number;
    maxSalaryLPA: number;
    preferredLocations: string;
    workModePref: WorkModePref;
    aiAssistLevel: AiAssistLevel;
    enabledPortals: JobPortal[];
  };
  setDraft: React.Dispatch<React.SetStateAction<typeof draft>>;
  profile: ReturnType<typeof useProfileStore.getState>;
  resumes: Resume[];
  loadResume: (id: string) => void;
  togglePortalDraft: (portal: JobPortal) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex shrink-0 gap-1 mx-4 lg:mx-0 rounded-lg bg-muted p-1">
        {(["profile", "prefs"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]",
              tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
            )}
          >
            {t === "profile" ? "Profile" : "Prefs"}
          </button>
        ))}
      </div>

      <div className="sheet-body-scroll px-4 lg:px-0 py-3 space-y-3">
        {tab === "profile" ? (
          <>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={draft.displayName}
                onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Current level</Label>
                <Input
                  value={draft.currentLevel}
                  onChange={(e) => setDraft({ ...draft, currentLevel: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Years experience</Label>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draft.yearsExperience}
                  onChange={(e) =>
                    setDraft({ ...draft, yearsExperience: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Target role</Label>
              <Input
                value={draft.targetRole}
                onChange={(e) => setDraft({ ...draft, targetRole: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Skills (comma-separated)</Label>
              <Input
                value={draft.skills}
                onChange={(e) => setDraft({ ...draft, skills: e.target.value })}
                placeholder="React, TypeScript, Node.js…"
              />
            </div>
            <div className="space-y-1">
              <Label>Link resume (optional)</Label>
              <select
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-base lg:text-sm"
                value={profile.resumeId ?? ""}
                onChange={(e) => loadResume(e.target.value)}
              >
                <option value="">None</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                    {r.has_extracted_text ? " · ready" : ""}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <Label>Min LPA</Label>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draft.minSalaryLPA}
                  onChange={(e) =>
                    setDraft({ ...draft, minSalaryLPA: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Max LPA</Label>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draft.maxSalaryLPA}
                  onChange={(e) =>
                    setDraft({ ...draft, maxSalaryLPA: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Locations</Label>
              <Input
                value={draft.preferredLocations}
                onChange={(e) => setDraft({ ...draft, preferredLocations: e.target.value })}
                placeholder="Bangalore, Remote"
              />
            </div>
            <div className="space-y-1">
              <Label>Work mode</Label>
              <select
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-base lg:text-sm"
                value={draft.workModePref}
                onChange={(e) =>
                  setDraft({ ...draft, workModePref: e.target.value as WorkModePref })
                }
              >
                {(["Any", "Remote", "Hybrid", "Onsite"] as WorkModePref[]).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Job portals</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_PORTALS.map((portal) => (
                  <Badge
                    key={portal}
                    variant={draft.enabledPortals.includes(portal) ? "default" : "outline"}
                    className="cursor-pointer select-none transition-transform active:scale-95 py-1.5 min-h-[32px]"
                    onClick={() => togglePortalDraft(portal)}
                  >
                    {portal}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label>AI assist</Label>
              <select
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-base lg:text-sm"
                value={draft.aiAssistLevel}
                onChange={(e) =>
                  setDraft({ ...draft, aiAssistLevel: e.target.value as AiAssistLevel })
                }
              >
                {(Object.keys(AI_ASSIST_LABELS) as AiAssistLevel[]).map((level) => (
                  <option key={level} value={level}>
                    {AI_ASSIST_LABELS[level]}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="sheet-bottom-footer shrink-0">
        <Button onClick={onSave} className="w-full h-11 rounded-lg">
          <Save className="h-4 w-4" />
          Save profile
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="w-full h-10 rounded-lg text-muted-foreground"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

export function ProfileSheetProvider({ children }: { children: React.ReactNode }) {
  const profile = useProfileStore();
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [tab, setTab] = useState<"profile" | "prefs">("profile");
  const [draft, setDraft] = useState({
    displayName: profile.displayName,
    currentLevel: profile.currentLevel,
    targetRole: profile.targetRole,
    yearsExperience: profile.yearsExperience,
    skills: profile.skills,
    minSalaryLPA: profile.minSalaryLPA,
    maxSalaryLPA: profile.maxSalaryLPA,
    preferredLocations: profile.preferredLocations,
    workModePref: profile.workModePref,
    aiAssistLevel: profile.aiAssistLevel,
    enabledPortals: [...profile.enabledPortals],
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    setDraft({
      displayName: profile.displayName,
      currentLevel: profile.currentLevel,
      targetRole: profile.targetRole,
      yearsExperience: profile.yearsExperience,
      skills: profile.skills,
      minSalaryLPA: profile.minSalaryLPA,
      maxSalaryLPA: profile.maxSalaryLPA,
      preferredLocations: profile.preferredLocations,
      workModePref: profile.workModePref,
      aiAssistLevel: profile.aiAssistLevel,
      enabledPortals: [...profile.enabledPortals],
    });
    api
      .get<ResumeListResponse>("/resumes")
      .then((d) => setResumes(d.items))
      .catch(() => undefined);
  }, [open, profile]);

  const loadResume = async (id: string) => {
    if (!id) {
      profile.setResume(null, "", "");
      return;
    }
    const resume = resumes.find((r) => String(r.id) === id);
    if (!resume) return;
    let excerpt = "";
    if (resume.has_extracted_text) {
      try {
        const data = await api.get<{ extracted_text: string }>(`/resumes/${id}/text`);
        excerpt = data.extracted_text.slice(0, 5000);
      } catch {
        excerpt = "";
      }
    }
    profile.setResume(resume.id, resume.name, excerpt);
    if (resume.skills_highlighted) {
      setDraft((d) => ({ ...d, skills: resume.skills_highlighted || d.skills }));
    }
    if (resume.target_role) {
      setDraft((d) => ({ ...d, targetRole: resume.target_role || d.targetRole }));
    }
  };

  const togglePortalDraft = (portal: JobPortal) => {
    setDraft((d) => {
      const has = d.enabledPortals.includes(portal);
      const next = has
        ? d.enabledPortals.filter((p) => p !== portal)
        : [...d.enabledPortals, portal];
      return { ...d, enabledPortals: next.length ? next : [portal] };
    });
  };

  const save = () => {
    profile.setProfile({ ...draft, onboardingDone: true });
    setOpen(false);
  };

  const editorProps = {
    tab,
    setTab,
    draft,
    setDraft,
    profile,
    resumes,
    loadResume,
    togglePortalDraft,
    onSave: save,
    onClose: () => setOpen(false),
  };

  return (
    <ProfileSheetContext.Provider value={{ openProfile: () => setOpen(true) }}>
      {children}

      {/* Mobile: bottom sheet — scrollable, closable */}
      {!isDesktop && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" hideClose className="p-0 gap-0">
            <SheetTitle className="sr-only">Career profile</SheetTitle>
            <SheetBottomHeader
              title="Career profile"
              description="Optional — Job Mentor chat also builds your profile."
              onClose={() => setOpen(false)}
            />
            <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
              <ProfileEditor {...editorProps} />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop: centered dialog */}
      {isDesktop && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 max-h-[85vh] min-h-0 lg:p-6 lg:gap-4">
            <DialogHeader className="shrink-0 px-4 pt-4 lg:px-0 lg:pt-0">
              <DialogTitle>Career profile & job prefs</DialogTitle>
              <DialogDescription>
                Saved on this device. Powers job matching, portal links, and AI features.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
              <ProfileEditor {...editorProps} />
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
      {/* Mobile: avatar icon only */}
      <button
        type="button"
        onClick={openProfile}
        className={cn("lg:hidden mobile-avatar-btn", className)}
        aria-label="Open profile"
      >
        <Avatar className="h-9 w-9 border border-border/60">
          <AvatarFallback className="bg-muted text-xs font-semibold">
            {initials(profile.displayName, profile.targetRole)}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Desktop: text button */}
      <Button
        variant="outline"
        size="sm"
        onClick={openProfile}
        className={cn("hidden lg:inline-flex gap-1.5 text-sm rounded-lg min-h-9", className)}
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
