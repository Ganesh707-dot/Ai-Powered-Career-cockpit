"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WorkModePref = "Remote" | "Hybrid" | "Onsite" | "Any";
export type AiAssistLevel = "manual" | "balanced" | "full";
export type JobPortal =
  | "LinkedIn"
  | "Naukri"
  | "Indeed"
  | "Wellfound"
  | "Instahyre"
  | "Glassdoor";

export interface CareerProfile {
  displayName: string;
  currentLevel: string;
  targetRole: string;
  yearsExperience: number;
  skills: string;
  resumeId: number | null;
  resumeName: string;
  resumeExcerpt: string;
  onboardingDone: boolean;
  // Job search preferences
  minSalaryLPA: number;
  maxSalaryLPA: number;
  preferredLocations: string;
  workModePref: WorkModePref;
  enabledPortals: JobPortal[];
  aiAssistLevel: AiAssistLevel;
}

interface ProfileState extends CareerProfile {
  setProfile: (patch: Partial<CareerProfile>) => void;
  setSkills: (skills: string) => void;
  setResume: (id: number | null, name: string, excerpt: string) => void;
  togglePortal: (portal: JobPortal) => void;
  skillsList: () => string[];
  locationsList: () => string[];
  isReady: () => boolean;
}

const defaults: CareerProfile = {
  displayName: "",
  currentLevel: "Mid-level (2-4 YOE)",
  targetRole: "Senior Full Stack Developer",
  yearsExperience: 3,
  skills: "",
  resumeId: null,
  resumeName: "",
  resumeExcerpt: "",
  onboardingDone: false,
  minSalaryLPA: 15,
  maxSalaryLPA: 30,
  preferredLocations: "Bangalore, Remote",
  workModePref: "Any",
  enabledPortals: ["LinkedIn", "Naukri", "Indeed", "Wellfound", "Instahyre"],
  aiAssistLevel: "balanced",
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...defaults,
      setProfile: (patch) => set((s) => ({ ...s, ...patch })),
      setSkills: (skills) => set({ skills }),
      setResume: (id, name, excerpt) =>
        set({ resumeId: id, resumeName: name, resumeExcerpt: excerpt }),
      togglePortal: (portal) =>
        set((s) => {
          const enabled = s.enabledPortals.includes(portal)
            ? s.enabledPortals.filter((p) => p !== portal)
            : [...s.enabledPortals, portal];
          return { enabledPortals: enabled.length ? enabled : [portal] };
        }),
      skillsList: () =>
        get()
          .skills.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      locationsList: () =>
        get()
          .preferredLocations.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      isReady: () => {
        const s = get();
        return s.skillsList().length > 0 || s.resumeExcerpt.trim().length >= 40;
      },
    }),
    {
      name: "careerpilot-profile-v2",
      migrate: (persisted: unknown) => {
        const p = (persisted || {}) as Partial<CareerProfile>;
        return { ...defaults, ...p };
      },
      version: 2,
    }
  )
);

export const AI_ASSIST_LABELS: Record<AiAssistLevel, string> = {
  manual: "Manual — you drive, AI on demand",
  balanced: "Balanced — AI suggests, you decide",
  full: "Full AI — auto-match, prep & coach",
};
