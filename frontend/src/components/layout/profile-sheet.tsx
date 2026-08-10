"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "careerpilot-onboarding-dismissed";

const ALL_PORTALS = Object.keys(PORTAL_META) as JobPortal[];

export function ProfileSheet() {
  const profile = useProfileStore();
  const [open, setOpen] = useState(false);
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

  // Auto-prompt once per device — never trap the user in a loop
  useEffect(() => {
    const state = useProfileStore.getState();
    if (state.onboardingDone || state.isReady()) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY)) return;

    const timer = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next && typeof window !== "undefined") {
      sessionStorage.setItem(DISMISS_KEY, "1");
    }
  }, []);

  const skipForNow = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISS_KEY, "1");
    }
    profile.setProfile({ onboardingDone: true });
    setOpen(false);
  };

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
    profile.setProfile({
      ...draft,
      onboardingDone: true,
    });
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISS_KEY, "1");
    }
    setOpen(false);
  };

  const ready = profile.isReady();

  return (
    <>
      <Button
        variant={ready ? "outline" : "default"}
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-xs sm:text-sm rounded-lg"
      >
        <UserRound className="h-4 w-4" />
        <span className="hidden sm:inline max-w-[80px] md:max-w-none truncate">
          {ready ? profile.displayName || "Profile" : "Setup"}
        </span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="overflow-hidden flex flex-col max-h-[min(92dvh,720px)] sm:max-h-[90vh]">
          <DialogHeader className="shrink-0">
            <DialogTitle>Career profile & job prefs</DialogTitle>
            <DialogDescription>
              Saved on this device. Powers job matching, portal links, and AI features.
            </DialogDescription>
          </DialogHeader>

          <div className="flex shrink-0 gap-1 rounded-lg bg-muted p-1">
            {(["profile", "prefs"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 rounded-md py-2 text-sm font-medium transition-all duration-200",
                  tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                {t === "profile" ? "Profile" : "Prefs"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto touch-scroll scrollbar-thin -mx-1 px-1 space-y-3 min-h-0">
            {tab === "profile" ? (
              <>
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={draft.displayName}
                    onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
                    placeholder="Your name"
                    className="h-11"
                  />
                </div>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Current level</Label>
                    <Input
                      value={draft.currentLevel}
                      onChange={(e) => setDraft({ ...draft, currentLevel: e.target.value })}
                      className="h-11"
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
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Target role</Label>
                  <Input
                    value={draft.targetRole}
                    onChange={(e) => setDraft({ ...draft, targetRole: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Skills (comma-separated) *</Label>
                  <Input
                    value={draft.skills}
                    onChange={(e) => setDraft({ ...draft, skills: e.target.value })}
                    placeholder="React, TypeScript, Node.js…"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Link resume (optional)</Label>
                  <select
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
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
                      className="h-11"
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
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Locations</Label>
                  <Input
                    value={draft.preferredLocations}
                    onChange={(e) =>
                      setDraft({ ...draft, preferredLocations: e.target.value })
                    }
                    placeholder="Bangalore, Remote"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Work mode</Label>
                  <select
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
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
                        className="cursor-pointer select-none transition-transform active:scale-95 py-1.5"
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
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
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

          <div className="shrink-0 flex flex-col gap-2 pt-2 border-t border-border/60">
            <Button onClick={save} className="w-full h-11 rounded-lg">
              <Save className="h-4 w-4" />
              Save profile
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={skipForNow}
              className="w-full h-10 text-muted-foreground rounded-lg"
            >
              Skip for now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
