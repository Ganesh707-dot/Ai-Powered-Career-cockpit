"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
}

interface ProfileState extends CareerProfile {
  setProfile: (patch: Partial<CareerProfile>) => void;
  setSkills: (skills: string) => void;
  setResume: (id: number | null, name: string, excerpt: string) => void;
  skillsList: () => string[];
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
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...defaults,
      setProfile: (patch) => set((s) => ({ ...s, ...patch })),
      setSkills: (skills) => set({ skills }),
      setResume: (id, name, excerpt) =>
        set({ resumeId: id, resumeName: name, resumeExcerpt: excerpt }),
      skillsList: () =>
        get()
          .skills.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      isReady: () => {
        const s = get();
        return s.skillsList().length > 0 || s.resumeExcerpt.trim().length >= 40;
      },
    }),
    { name: "careerpilot-profile-v1" }
  )
);
