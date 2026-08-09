"use client";

import { useEffect, useState } from "react";
import { UserRound, Save } from "lucide-react";
import { api } from "@/lib/api";
import { useProfileStore } from "@/stores/profile-store";
import type { Resume, ResumeListResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProfileSheet() {
  const profile = useProfileStore();
  const [open, setOpen] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [draft, setDraft] = useState({
    displayName: profile.displayName,
    currentLevel: profile.currentLevel,
    targetRole: profile.targetRole,
    yearsExperience: profile.yearsExperience,
    skills: profile.skills,
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
    });
    api
      .get<ResumeListResponse>("/resumes")
      .then((d) => setResumes(d.items))
      .catch(() => undefined);
  }, [open, profile.displayName, profile.currentLevel, profile.targetRole, profile.yearsExperience, profile.skills]);

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
        className="gap-2"
      >
        <UserRound className="h-4 w-4" />
        {ready
          ? profile.displayName || profile.targetRole || "My Profile"
          : "Set up profile"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Your career profile</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Saved on this device and used to personalize JD match, interview prep, HR answers,
            mentor coaching, and learning plans.
          </p>
          <div className="space-y-3 pt-2">
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
                placeholder="React, TypeScript, Next.js, Node.js…"
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
              {profile.resumeName && (
                <p className="text-xs text-emerald-400">
                  Using resume: {profile.resumeName}
                  {profile.resumeExcerpt
                    ? ` (${profile.resumeExcerpt.length} chars)`
                    : " (no file text yet)"}
                </p>
              )}
            </div>
            <Button onClick={save} className="w-full">
              <Save className="h-4 w-4" />
              Save personalized profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
