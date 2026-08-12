"use client";

import { create } from "zustand";

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
  minSalaryLPA: number;
  maxSalaryLPA: number;
  preferredLocations: string;
  workModePref: WorkModePref;
  enabledPortals: JobPortal[];
  aiAssistLevel: AiAssistLevel;
}

interface ProfileState extends CareerProfile {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setProfile: (patch: Partial<CareerProfile>) => void;
  setSkills: (skills: string) => void;
  setResume: (id: number | null, name: string, excerpt: string) => void;
  togglePortal: (portal: JobPortal) => void;
  skillsList: () => string[];
  locationsList: () => string[];
  isReady: () => boolean;
  toApiPayload: () => Record<string, unknown>;
  loadFromApi: (data: Record<string, unknown>) => void;
}

export const profileDefaults: CareerProfile = {
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

export const useProfileStore = create<ProfileState>()((set, get) => ({
  ...profileDefaults,
  hydrated: false,
  setHydrated: (hydrated) => set({ hydrated }),
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
  toApiPayload: () => {
    const s = get();
    return {
      display_name: s.displayName,
      current_level: s.currentLevel,
      target_role: s.targetRole,
      years_experience: s.yearsExperience,
      skills: s.skills,
      resume_id: s.resumeId,
      resume_name: s.resumeName,
      resume_excerpt: s.resumeExcerpt,
      onboarding_done: s.onboardingDone,
      min_salary_lpa: s.minSalaryLPA,
      max_salary_lpa: s.maxSalaryLPA,
      preferred_locations: s.preferredLocations,
      work_mode_pref: s.workModePref,
      enabled_portals: s.enabledPortals,
      ai_assist_level: s.aiAssistLevel,
    };
  },
  loadFromApi: (data) =>
    set({
      displayName: String(data.display_name ?? ""),
      currentLevel: String(data.current_level ?? profileDefaults.currentLevel),
      targetRole: String(data.target_role ?? profileDefaults.targetRole),
      yearsExperience: Number(data.years_experience ?? profileDefaults.yearsExperience),
      skills: String(data.skills ?? ""),
      resumeId: data.resume_id != null ? Number(data.resume_id) : null,
      resumeName: String(data.resume_name ?? ""),
      resumeExcerpt: String(data.resume_excerpt ?? ""),
      onboardingDone: Boolean(data.onboarding_done),
      minSalaryLPA: Number(data.min_salary_lpa ?? profileDefaults.minSalaryLPA),
      maxSalaryLPA: Number(data.max_salary_lpa ?? profileDefaults.maxSalaryLPA),
      preferredLocations: String(
        data.preferred_locations ?? profileDefaults.preferredLocations
      ),
      workModePref: (data.work_mode_pref as WorkModePref) ?? profileDefaults.workModePref,
      enabledPortals: (data.enabled_portals as JobPortal[]) ?? profileDefaults.enabledPortals,
      aiAssistLevel: (data.ai_assist_level as AiAssistLevel) ?? profileDefaults.aiAssistLevel,
      hydrated: true,
    }),
}));

export const AI_ASSIST_LABELS: Record<AiAssistLevel, string> = {
  manual: "Manual — you drive, AI on demand",
  balanced: "Balanced — AI suggests, you decide",
  full: "Full AI — auto-match, prep & coach",
};
