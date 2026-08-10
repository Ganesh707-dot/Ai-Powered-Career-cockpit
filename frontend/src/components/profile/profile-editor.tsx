"use client";

import { Save } from "lucide-react";
import {
  useProfileStore,
  AI_ASSIST_LABELS,
  type AiAssistLevel,
  type JobPortal,
  type WorkModePref,
} from "@/stores/profile-store";
import { PORTAL_META } from "@/lib/job-portals";
import type { Resume } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ALL_PORTALS = Object.keys(PORTAL_META) as JobPortal[];

export type ProfileDraft = {
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

export function ProfileEditor({
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
  variant = "sheet",
}: {
  tab: "profile" | "prefs";
  setTab: (t: "profile" | "prefs") => void;
  draft: ProfileDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProfileDraft>>;
  profile: ReturnType<typeof useProfileStore.getState>;
  resumes: Resume[];
  loadResume: (id: string) => void;
  togglePortalDraft: (portal: JobPortal) => void;
  onSave: () => void;
  onClose?: () => void;
  variant?: "sheet" | "page";
}) {
  const isPage = variant === "page";

  return (
    <div
      className={cn(
        "flex flex-col min-h-0",
        isPage ? "flex-1" : "flex-1 overflow-hidden"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 gap-1 rounded-lg bg-muted p-1",
          isPage ? "mx-4 mt-2" : "mx-4 xl:mx-0"
        )}
      >
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

      <div
        className={cn(
          "modal-body",
          isPage && "pb-28 xl:pb-4"
        )}
      >
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
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-base xl:text-sm"
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
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-base xl:text-sm"
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
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-base xl:text-sm"
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

      <div
        className={cn(
          "modal-footer modal-footer-stacked",
          isPage &&
            "fixed inset-x-0 bottom-[calc(var(--mobile-tab-height)+env(safe-area-inset-bottom,0px))] xl:static z-20"
        )}
      >
        <Button onClick={onSave} className="w-full h-11 rounded-lg">
          <Save className="h-4 w-4" />
          Save profile
        </Button>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full h-10 rounded-lg text-muted-foreground"
          >
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
