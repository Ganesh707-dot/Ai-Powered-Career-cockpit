"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Resume, ResumeType } from "@/types";

/** Locally persisted resume — survives backend cold starts on Vercel. */
export interface StoredResume {
  id: number;
  localId: string;
  name: string;
  resume_type: ResumeType;
  target_role?: string | null;
  skills_highlighted?: string | null;
  notes?: string | null;
  has_extracted_text: boolean;
  extracted_text: string;
  last_updated?: string | null;
  saved_at: string;
}

interface ResumeState {
  items: StoredResume[];
  upsertFromApi: (resume: Resume, extractedText?: string) => void;
  upsertLocal: (resume: Omit<StoredResume, "localId" | "saved_at"> & { localId?: string }) => void;
  remove: (id: number) => void;
  mergeWithApi: (apiItems: Resume[]) => StoredResume[];
  getById: (id: number) => StoredResume | undefined;
  getPrimary: () => StoredResume | undefined;
}

function toStored(resume: Resume, text: string): StoredResume {
  return {
    id: resume.id,
    localId: `api-${resume.id}`,
    name: resume.name,
    resume_type: resume.resume_type,
    target_role: resume.target_role,
    skills_highlighted: resume.skills_highlighted,
    notes: resume.notes,
    has_extracted_text: Boolean(text.trim() || resume.has_extracted_text),
    extracted_text: text.slice(0, 50000),
    last_updated: resume.last_updated,
    saved_at: new Date().toISOString(),
  };
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      items: [],
      upsertFromApi: (resume, extractedText = "") =>
        set((s) => {
          const next = toStored(resume, extractedText);
          const filtered = s.items.filter((r) => r.id !== resume.id);
          return { items: [next, ...filtered] };
        }),
      upsertLocal: (resume) =>
        set((s) => {
          const localId = resume.localId || `local-${Date.now()}`;
          const entry: StoredResume = {
            ...resume,
            localId,
            saved_at: new Date().toISOString(),
          };
          const filtered = s.items.filter(
            (r) => r.localId !== localId && r.id !== resume.id
          );
          return { items: [entry, ...filtered] };
        }),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((r) => r.id !== id) })),
      getById: (id) => get().items.find((r) => r.id === id),
      getPrimary: () => get().items[0],
      mergeWithApi: (apiItems) => {
        const local = get().items;
        const byId = new Map<number, StoredResume>();
        for (const item of local) byId.set(item.id, item);
        for (const api of apiItems) {
          const existing = byId.get(api.id);
          const text = existing?.extracted_text ?? "";
          byId.set(
            api.id,
            existing
              ? { ...existing, name: api.name, resume_type: api.resume_type, target_role: api.target_role }
              : toStored(api, text)
          );
        }
        const merged = Array.from(byId.values()).sort(
          (a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
        );
        if (merged.length !== local.length) set({ items: merged });
        return merged.length ? merged : local;
      },
    }),
    { name: "careerpilot-resumes-v1", version: 1 }
  )
);

/** Map stored resume to API Resume shape for UI lists. */
export function storedToResume(r: StoredResume): Resume {
  return {
    id: r.id,
    name: r.name,
    resume_type: r.resume_type,
    target_role: r.target_role,
    skills_highlighted: r.skills_highlighted,
    notes: r.notes,
    has_extracted_text: r.has_extracted_text,
    last_updated: r.last_updated,
    created_at: r.saved_at,
    updated_at: r.saved_at,
  };
}
