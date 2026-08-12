"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MentorMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface InterviewScenario {
  id: string;
  skill: string;
  prompt: string;
  userAnswer?: string;
  feedback?: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface LiveCodeChallenge {
  id: string;
  title: string;
  skill: string;
  problem: string;
  hints: string[];
  completed: boolean;
}

/** Per-job execution context — separate memory for each application. */
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
  scenarios: InterviewScenario[];
  liveCode: LiveCodeChallenge[];
  lastUpdated: string;
}

interface JobContextState {
  contexts: Record<string, JobExecutionContext>;
  globalIntent: string;
  globalStrengths: string[];
  globalWeaknesses: string[];
  setGlobalInsights: (patch: {
    intent?: string;
    strengths?: string[];
    weaknesses?: string[];
  }) => void;
  getContext: (key: string) => JobExecutionContext | undefined;
  upsertContext: (ctx: Partial<JobExecutionContext> & { key: string; company: string; role: string }) => void;
  appendMentorMessage: (key: string, message: Omit<MentorMessage, "at">) => void;
  addScenario: (key: string, scenario: Omit<InterviewScenario, "id">) => void;
  addLiveCode: (key: string, challenge: Omit<LiveCodeChallenge, "id">) => void;
  jobKey: (company: string, role: string, applicationId?: number) => string;
}

function defaultContext(key: string, company: string, role: string): JobExecutionContext {
  return {
    key,
    company,
    role,
    intent: "",
    strengths: [],
    weaknesses: [],
    skillsFocus: [],
    mentorThread: [],
    scenarios: [],
    liveCode: [],
    lastUpdated: new Date().toISOString(),
  };
}

export const useJobContextStore = create<JobContextState>()(
  persist(
    (set, get) => ({
      contexts: {},
      globalIntent: "",
      globalStrengths: [],
      globalWeaknesses: [],
      jobKey: (company, role, applicationId) =>
        applicationId ? `app-${applicationId}` : `${company}::${role}`.toLowerCase(),
      getContext: (key) => get().contexts[key],
      setGlobalInsights: (patch) =>
        set((s) => ({
          globalIntent: patch.intent ?? s.globalIntent,
          globalStrengths: patch.strengths ?? s.globalStrengths,
          globalWeaknesses: patch.weaknesses ?? s.globalWeaknesses,
        })),
      upsertContext: (partial) =>
        set((s) => {
          const existing = s.contexts[partial.key] || defaultContext(partial.key, partial.company, partial.role);
          const merged: JobExecutionContext = {
            ...existing,
            ...partial,
            strengths: partial.strengths ?? existing.strengths,
            weaknesses: partial.weaknesses ?? existing.weaknesses,
            skillsFocus: partial.skillsFocus ?? existing.skillsFocus,
            lastUpdated: new Date().toISOString(),
          };
          return { contexts: { ...s.contexts, [partial.key]: merged } };
        }),
      appendMentorMessage: (key, message) =>
        set((s) => {
          let ctx = s.contexts[key];
          if (!ctx) {
            ctx = defaultContext(key, "Career Map", "General");
          }
          return {
            contexts: {
              ...s.contexts,
              [key]: {
                ...ctx,
                mentorThread: [
                  ...ctx.mentorThread,
                  { ...message, at: new Date().toISOString() },
                ].slice(-40),
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        }),
      addScenario: (key, scenario) =>
        set((s) => {
          const ctx = s.contexts[key];
          if (!ctx) return s;
          const entry: InterviewScenario = { ...scenario, id: `sc-${Date.now()}` };
          return {
            contexts: {
              ...s.contexts,
              [key]: {
                ...ctx,
                scenarios: [entry, ...ctx.scenarios].slice(0, 20),
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        }),
      addLiveCode: (key, challenge) =>
        set((s) => {
          const ctx = s.contexts[key];
          if (!ctx) return s;
          const entry: LiveCodeChallenge = { ...challenge, id: `lc-${Date.now()}` };
          return {
            contexts: {
              ...s.contexts,
              [key]: {
                ...ctx,
                liveCode: [entry, ...ctx.liveCode].slice(0, 15),
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        }),
    }),
    { name: "careerpilot-job-contexts-v1", version: 1 }
  )
);
