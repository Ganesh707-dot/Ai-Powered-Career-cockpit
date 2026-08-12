"use client";

import { create } from "zustand";
import { api } from "@/lib/api";

export interface MentorMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface JobExecutionContext {
  key: string;
  applicationId?: number;
  company: string;
  role: string;
  intent: string;
  strengths: string[];
  weaknesses: string[];
  skillsFocus: string[];
  mentorThread: MentorMessage[];
  scenarios: Record<string, unknown>[];
  liveCode: Record<string, unknown>[];
  lastUpdated: string;
}

interface JobContextState {
  contexts: Record<string, JobExecutionContext>;
  globalIntent: string;
  globalStrengths: string[];
  globalWeaknesses: string[];
  hydrated: boolean;
  bootstrap: () => Promise<void>;
  setGlobalInsights: (patch: {
    intent?: string;
    strengths?: string[];
    weaknesses?: string[];
  }) => void;
  getContext: (key: string) => JobExecutionContext | undefined;
  upsertContext: (
    ctx: Partial<JobExecutionContext> & { key: string; company: string; role: string }
  ) => void;
  appendMentorMessage: (key: string, message: Omit<MentorMessage, "at">) => void;
  jobKey: (company: string, role: string, applicationId?: number) => string;
}

function mapFromApi(item: Record<string, unknown>): JobExecutionContext {
  return {
    key: String(item.context_key),
    applicationId: item.application_id != null ? Number(item.application_id) : undefined,
    company: String(item.company ?? ""),
    role: String(item.role ?? ""),
    intent: String(item.intent ?? ""),
    strengths: (item.strengths as string[]) ?? [],
    weaknesses: (item.weaknesses as string[]) ?? [],
    skillsFocus: (item.skills_focus as string[]) ?? [],
    mentorThread: (item.mentor_thread as MentorMessage[]) ?? [],
    scenarios: (item.scenarios as Record<string, unknown>[]) ?? [],
    liveCode: (item.live_code as Record<string, unknown>[]) ?? [],
    lastUpdated: String(item.updated_at ?? new Date().toISOString()),
  };
}

function toApiPayload(ctx: JobExecutionContext) {
  return {
    context_key: ctx.key,
    application_id: ctx.applicationId ?? null,
    company: ctx.company,
    role: ctx.role,
    intent: ctx.intent,
    strengths: ctx.strengths,
    weaknesses: ctx.weaknesses,
    skills_focus: ctx.skillsFocus,
    mentor_thread: ctx.mentorThread,
    scenarios: ctx.scenarios,
    live_code: ctx.liveCode,
  };
}

export const useJobContextStore = create<JobContextState>()((set, get) => ({
  contexts: {},
  globalIntent: "",
  globalStrengths: [],
  globalWeaknesses: [],
  hydrated: false,
  jobKey: (company, role, applicationId) =>
    applicationId ? `app-${applicationId}` : `${company}::${role}`.toLowerCase(),
  bootstrap: async () => {
    try {
      const res = await api.get<{ items: Record<string, unknown>[] }>("/workspace/job-contexts");
      const contexts: Record<string, JobExecutionContext> = {};
      for (const item of res.items) {
        const ctx = mapFromApi(item);
        contexts[ctx.key] = ctx;
      }
      set({ contexts, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  getContext: (key) => get().contexts[key],
  setGlobalInsights: (patch) =>
    set((s) => ({
      globalIntent: patch.intent ?? s.globalIntent,
      globalStrengths: patch.strengths ?? s.globalStrengths,
      globalWeaknesses: patch.weaknesses ?? s.globalWeaknesses,
    })),
  upsertContext: (partial) => {
    const existing = get().contexts[partial.key];
    const merged: JobExecutionContext = {
      key: partial.key,
      company: partial.company,
      role: partial.role,
      applicationId: partial.applicationId ?? existing?.applicationId,
      intent: partial.intent ?? existing?.intent ?? "",
      strengths: partial.strengths ?? existing?.strengths ?? [],
      weaknesses: partial.weaknesses ?? existing?.weaknesses ?? [],
      skillsFocus: partial.skillsFocus ?? existing?.skillsFocus ?? [],
      mentorThread: partial.mentorThread ?? existing?.mentorThread ?? [],
      scenarios: partial.scenarios ?? existing?.scenarios ?? [],
      liveCode: partial.liveCode ?? existing?.liveCode ?? [],
      lastUpdated: new Date().toISOString(),
    };
    set((s) => ({ contexts: { ...s.contexts, [partial.key]: merged } }));
    api.put(`/workspace/job-contexts/${encodeURIComponent(partial.key)}`, toApiPayload(merged)).catch(
      () => undefined
    );
  },
  appendMentorMessage: (key, message) => {
    const existing = get().contexts[key];
    const base: JobExecutionContext = existing ?? {
      key,
      company: "Career Map",
      role: "General",
      intent: "",
      strengths: [],
      weaknesses: [],
      skillsFocus: [],
      mentorThread: [],
      scenarios: [],
      liveCode: [],
      lastUpdated: new Date().toISOString(),
    };
    const mentorThread = [
      ...base.mentorThread,
      { ...message, at: new Date().toISOString() },
    ].slice(-40);
    const merged = { ...base, mentorThread, lastUpdated: new Date().toISOString() };
    set((s) => ({ contexts: { ...s.contexts, [key]: merged } }));
    api
      .post(`/workspace/job-contexts/${encodeURIComponent(key)}/messages`, {
        role: message.role,
        content: message.content,
      })
      .catch(() => undefined);
  },
}));
