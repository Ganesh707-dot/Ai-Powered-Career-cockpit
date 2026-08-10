"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  useProfileStore,
  type JobPortal,
} from "@/stores/profile-store";
import type { Resume, ResumeListResponse } from "@/types";
import type { ProfileDraft } from "@/components/profile/profile-editor";

export function useProfileForm() {
  const profile = useProfileStore();
  const [tab, setTab] = useState<"profile" | "prefs">("profile");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [draft, setDraft] = useState<ProfileDraft>(() => ({
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
  }));

  useEffect(() => {
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
  }, [profile]);

  useEffect(() => {
    api
      .get<ResumeListResponse>("/resumes")
      .then((d) => setResumes(d.items))
      .catch(() => undefined);
  }, []);

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
  };

  return {
    tab,
    setTab,
    draft,
    setDraft,
    profile,
    resumes,
    loadResume,
    togglePortalDraft,
    save,
  };
}
