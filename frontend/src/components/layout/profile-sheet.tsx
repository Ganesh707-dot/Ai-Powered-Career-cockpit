"use client";

import { useEffect, useState } from "react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (!profile.onboardingDone && !profile.isReady()) {
      setOpen(true);
    }
  }, [profile]);

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
    setOpen(false);
  };

  const ready = profile.isReady();

  return (
    <>
      <Button
        variant={ready ? "outline" : "default"}
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-xs sm:text-sm"
      >
        <UserRound className="h-4 w-4" />
        <span className="hidden sm:inline max-w-[80px] md:max-w-none truncate">
          {ready ? profile.displayName || "Profile" : "Setup"}
        </span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Career profile & job prefs</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Saved on this device. Powers job matching, portal search links, and all AI features.
          </p>

          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {(["profile", "prefs"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-sm font-medium transition-all duration-200",
                  tab === t ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
              >
                {t === "profile" ? "Profile & skills" : "Search prefs"}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-1">
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
                <div className="grid gap-3 sm:grid-cols-2">
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
                  <Label>Skills (comma-separated) *</Label>
                  <Input
                    value={draft.skills}
                    onChange={(e) => setDraft({ ...draft, skills: e.target.value })}
                    placeholder="React, TypeScript, Node.js, Next.js…"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Link uploaded resume (optional)</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={profile.resumeId ?? ""}
                    onChange={(e) => loadResume(e.target.value)}
                  >
                    <option value="">None</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                        {r.has_extracted_text ? " · file ready" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Min salary (LPA)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.minSalaryLPA}
                      onChange={(e) =>
                        setDraft({ ...draft, minSalaryLPA: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Max salary (LPA)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.maxSalaryLPA}
                      onChange={(e) =>
                        setDraft({ ...draft, maxSalaryLPA: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Preferred locations (comma-separated)</Label>
                  <Input
                    value={draft.preferredLocations}
                    onChange={(e) =>
                      setDraft({ ...draft, preferredLocations: e.target.value })
                    }
                    placeholder="Bangalore, Remote, Mumbai"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Work mode</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
                  <Label>Job portals to search</Label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_PORTALS.map((portal) => (
                      <Badge
                        key={portal}
                        variant={draft.enabledPortals.includes(portal) ? "default" : "outline"}
                        className="cursor-pointer select-none transition-transform active:scale-95"
                        onClick={() => togglePortalDraft(portal)}
                      >
                        {portal}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>AI assist level</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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

            <Button onClick={save} className="w-full">
              <Save className="h-4 w-4" />
              Save profile & preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
