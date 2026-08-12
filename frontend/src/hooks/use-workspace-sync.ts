"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { profileDefaults, useProfileStore } from "@/stores/profile-store";

const LEGACY_PROFILE_KEY = "careerpilot-profile-v2";

/** Bootstrap profile from Postgres via API; debounced save on changes. */
export function useWorkspaceSync() {
  const profile = useProfileStore();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      try {
        const res = await api.get<{ profile: Record<string, unknown> }>("/workspace/profile");
        const p = res.profile;
        const hasData =
          p.resume_id ||
          (typeof p.skills === "string" && p.skills.trim()) ||
          (typeof p.resume_excerpt === "string" && p.resume_excerpt.trim().length >= 40);

        if (!hasData && typeof window !== "undefined") {
          const legacy = localStorage.getItem(LEGACY_PROFILE_KEY);
          if (legacy) {
            try {
              const parsed = JSON.parse(legacy) as { state?: Record<string, unknown> };
              const old = (parsed.state ?? parsed) as Record<string, unknown>;
              const migrated = {
                display_name: old.displayName ?? "",
                current_level: old.currentLevel ?? profileDefaults.currentLevel,
                target_role: old.targetRole ?? profileDefaults.targetRole,
                years_experience: old.yearsExperience ?? profileDefaults.yearsExperience,
                skills: old.skills ?? "",
                resume_id: old.resumeId ?? null,
                resume_name: old.resumeName ?? "",
                resume_excerpt: old.resumeExcerpt ?? "",
                onboarding_done: old.onboardingDone ?? false,
                min_salary_lpa: old.minSalaryLPA ?? profileDefaults.minSalaryLPA,
                max_salary_lpa: old.maxSalaryLPA ?? profileDefaults.maxSalaryLPA,
                preferred_locations: old.preferredLocations ?? profileDefaults.preferredLocations,
                work_mode_pref: old.workModePref ?? profileDefaults.workModePref,
                enabled_portals: old.enabledPortals ?? profileDefaults.enabledPortals,
                ai_assist_level: old.aiAssistLevel ?? profileDefaults.aiAssistLevel,
              };
              await api.put("/workspace/profile", migrated);
              profile.loadFromApi(migrated);
              return;
            } catch {
              /* fall through to API profile */
            }
          }
        }
        profile.loadFromApi(p);
      } catch {
        profile.setHydrated(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!profile.hydrated) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.put("/workspace/profile", profile.toApiPayload()).catch(() => undefined);
    }, 600);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [
    profile.hydrated,
    profile.displayName,
    profile.currentLevel,
    profile.targetRole,
    profile.yearsExperience,
    profile.skills,
    profile.resumeId,
    profile.resumeName,
    profile.resumeExcerpt,
    profile.onboardingDone,
    profile.minSalaryLPA,
    profile.maxSalaryLPA,
    profile.preferredLocations,
    profile.workModePref,
    profile.enabledPortals,
    profile.aiAssistLevel,
    profile,
  ]);
}
