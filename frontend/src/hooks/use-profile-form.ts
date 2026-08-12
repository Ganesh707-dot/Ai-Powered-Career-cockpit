"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  useProfileStore,
  type JobPortal,
} from "@/stores/profile-store";
import { useResumeStore, storedToResume } from "@/stores/resume-store";
import type { Resume, ResumeListResponse } from "@/types";
import type { ProfileDraft } from "@/components/profile/profile-editor";

export function useProfileForm() {
  const profile = useProfileStore();
  const resumeStore = useResumeStore();
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
      .then((d) => {
        const merged = useResumeStore.getState().mergeWithApi(d.items);
        setResumes(merged.map(storedToResume));
      })
      .catch(() => {
        const cached = useResumeStore.getState().items;
        if (cached.length) setResumes(cached.map(storedToResume));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!profile.resumeId || profile.resumeExcerpt.trim().length >= 40) return;
    const cached = useResumeStore.getState().getById(profile.resumeId);
    if (cached?.extracted_text) {
      profile.setResume(profile.resumeId, cached.name, cached.extracted_text.slice(0, 5000));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.resumeId]);

  const loadResume = async (id: string) => {
    if (!id) {
      profile.setResume(null, "", "");
      return;
    }
    const resume = resumes.find((r) => String(r.id) === id);
    const cached = resumeStore.getById(Number(id));
    if (!resume && !cached) return;
    let excerpt = cached?.extracted_text.slice(0, 5000) || "";
    if (!excerpt && resume?.has_extracted_text) {
      try {
        const data = await api.get<{ extracted_text: string }>(`/resumes/${id}/text`);
        excerpt = data.extracted_text.slice(0, 5000);
        if (resume) resumeStore.upsertFromApi(resume, excerpt);
      } catch {
        excerpt = "";
      }
    }
    profile.setResume(Number(id), resume?.name || cached?.name || "", excerpt);
    if (resume?.skills_highlighted) {
      setDraft((d) => ({ ...d, skills: resume.skills_highlighted || d.skills }));
    } else if (cached?.skills_highlighted) {
      setDraft((d) => ({ ...d, skills: cached.skills_highlighted || d.skills }));
    }
    if (resume?.target_role) {
      setDraft((d) => ({ ...d, targetRole: resume.target_role || d.targetRole }));
    } else if (cached?.target_role) {
      setDraft((d) => ({ ...d, targetRole: cached.target_role || d.targetRole }));
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
