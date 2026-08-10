"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  MessageCircle,
  Send,
  User,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { isAbortError, useLatestRequest } from "@/lib/use-latest-request";
import { useProfileStore } from "@/stores/profile-store";
import type { DiscoveredJob, JobMentorChatResponse, ProfileUpdates } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** Render AI/user text as readable paragraphs instead of one stacked block. */
function ChatMessageBody({ content }: { content: string }) {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  if (!normalized) return null;

  const paragraphs = normalized.split(/\n{2,}/).filter(Boolean);

  if (paragraphs.length > 1) {
    return (
      <div className="space-y-2.5">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-wrap break-words">
            {paragraph.trim()}
          </p>
        ))}
      </div>
    );
  }

  const lines = normalized.split(/\n/).filter(Boolean);
  if (lines.length > 1) {
    return (
      <div className="space-y-2">
        {lines.map((line, index) => (
          <p key={index} className="whitespace-pre-wrap break-words">
            {line.replace(/^[-•*]\s*/, "")}
          </p>
        ))}
      </div>
    );
  }

  return <p className="whitespace-pre-wrap break-words">{normalized}</p>;
}

const WELCOME =
  "Tell me what you want — role, salary, remote or onsite, stack. Paste resume text anytime and I'll pick up skills and intent from our chat.";

const STARTERS = [
  "Senior React roles, 15+ LPA, Bangalore",
  "Fully remote full-stack, fintech preferred",
  "Paste skills: React, Node, 3 YOE — match me",
];

function applyProfileUpdates(
  profile: ReturnType<typeof useProfileStore.getState>,
  updates: ProfileUpdates | null | undefined
) {
  if (!updates) return;
  const patch: Record<string, unknown> = { onboardingDone: true };
  if (updates.target_role) patch.targetRole = updates.target_role;
  if (updates.years_experience != null) patch.yearsExperience = updates.years_experience;
  if (updates.min_salary_lpa != null) patch.minSalaryLPA = updates.min_salary_lpa;
  if (updates.max_salary_lpa != null) patch.maxSalaryLPA = updates.max_salary_lpa;
  if (updates.work_mode) patch.workModePref = updates.work_mode;
  if (updates.preferred_locations?.length) {
    patch.preferredLocations = updates.preferred_locations.join(", ");
  }
  if (updates.skills?.length) {
    const existing = profile.skillsList();
    const merged = [...existing, ...updates.skills].filter(
      (s, i, arr) => arr.findIndex((x) => x.toLowerCase() === s.toLowerCase()) === i
    );
    patch.skills = merged.join(", ");
  }
  profile.setProfile(patch as Parameters<typeof profile.setProfile>[0]);
  if (updates.resume_snippet?.trim()) {
    profile.setResume(
      profile.resumeId,
      profile.resumeName || "From chat",
      updates.resume_snippet.slice(0, 5000)
    );
  }
}

interface JobMentorChatProps {
  onJobsUpdate: (jobs: DiscoveredJob[], total: number) => void;
  onTrack: (job: DiscoveredJob) => void;
  compact?: boolean;
}

export function JobMentorChat({ onJobsUpdate, onTrack, compact }: JobMentorChatProps) {
  const profile = useProfileStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchSummary, setSearchSummary] = useState("");
  const [resumeInsight, setResumeInsight] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [showResume, setShowResume] = useState(false);
  const [resumeDraft, setResumeDraft] = useState(profile.resumeExcerpt);
  const bottomRef = useRef<HTMLDivElement>(null);
  const latest = useLatestRequest();

  useEffect(() => {
    if (!profile.resumeId || profile.resumeExcerpt.trim().length >= 40) return;
    api
      .get<{ extracted_text: string }>(`/resumes/${profile.resumeId}/text`)
      .then((data) => {
        if (data.extracted_text?.trim()) {
          profile.setResume(
            profile.resumeId,
            profile.resumeName,
            data.extracted_text.slice(0, 5000)
          );
          setResumeDraft(data.extracted_text.slice(0, 5000));
        }
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.resumeId]);

  const buildPayload = useCallback(
    (history: ChatMessage[]) => ({
      messages: history.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      display_name: profile.displayName,
      current_level: profile.currentLevel,
      target_role: profile.targetRole,
      skills: profile.skillsList(),
      years_experience: profile.yearsExperience,
      resume_excerpt: profile.resumeExcerpt,
      resume_name: profile.resumeName,
      min_salary_lpa: profile.minSalaryLPA,
      max_salary_lpa: profile.maxSalaryLPA,
      preferred_locations: profile.locationsList(),
      work_mode: profile.workModePref,
      sources: profile.enabledPortals,
      limit: 8,
    }),
    [profile]
  );

  const handleMentorResponse = useCallback(
    (res: JobMentorChatResponse) => {
      setSearchSummary(res.search_summary);
      setResumeInsight(res.resume_insight);
      setKeywords(res.keywords || []);
      applyProfileUpdates(useProfileStore.getState(), res.profile_updates);
      onJobsUpdate(res.jobs, res.total_matches);
      return res.reply;
    },
    [onJobsUpdate]
  );

  const callMentor = useCallback(
    async (history: ChatMessage[], signal?: AbortSignal) => {
      const res = await api.post<JobMentorChatResponse>(
        "/job-mentor/chat",
        buildPayload(history),
        { signal }
      );
      return handleMentorResponse(res);
    },
    [buildPayload, handleMentorResponse]
  );

  useEffect(() => {
    // On mobile home the page scrolls as one surface — avoid trapping scroll in the chat.
    if (compact) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, thinking, compact]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    const { signal, isCurrent } = latest.begin();
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setThinking(true);
    setError(null);

    try {
      const reply = await callMentor(next, signal);
      if (!isCurrent()) return;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      if (isAbortError(err) || !isCurrent()) return;
      setError(err instanceof ApiError ? err.message : "Something went wrong — try again");
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      if (isCurrent()) setThinking(false);
    }
  };

  const saveResumeDraft = () => {
    const text = resumeDraft.trim();
    if (text.length >= 40) {
      profile.setResume(profile.resumeId, profile.resumeName || "Pasted resume", text.slice(0, 5000));
    }
    setShowResume(false);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const hasResume = profile.resumeExcerpt.trim().length >= 40;

  return (
    <div
      className={cn(
        "surface-elevated flex flex-col",
        compact
          ? "rounded-2xl touch-pan-y"
          : "overflow-hidden h-full min-h-[min(56vh,480px)]"
      )}
    >
      <div
        className={cn(
          "border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent",
          compact ? "px-4 py-3" : "px-4 py-4 sm:px-6"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-semibold text-base">Job mentor</h2>
              {compact && (
                <p className="text-[10px] text-primary/80 font-medium mt-0.5">
                  Intent-based · not keyword search
                </p>
              )}
            </div>
            {!compact && (
              <p className="mt-2 text-sm text-muted-foreground max-w-lg leading-relaxed">
                Conversation drives everything — intent, keywords, resume, and matches. No forms required.
              </p>
            )}
          </div>
          <Badge
            variant={hasResume ? "default" : "outline"}
            className="shrink-0 text-[10px] gap-1 rounded-full"
          >
            <FileText className="h-3 w-3" />
            {hasResume ? "Resume linked" : "Add resume"}
          </Badge>
        </div>
        {(searchSummary || resumeInsight || keywords.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchSummary && (
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                Intent: {searchSummary}
              </span>
            )}
            {keywords.map((k) => (
              <Badge key={k} variant="secondary" className="text-[10px] font-normal">
                {k}
              </Badge>
            ))}
            {resumeInsight && (
              <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                {resumeInsight}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={cn("flex flex-col", !compact && "flex-1 min-h-0")}>
        <div
          className={cn(
            "px-4 py-5 sm:px-6 space-y-4",
            !compact && "flex-1 min-h-0 overflow-y-auto touch-scroll scrollbar-thin overscroll-y-contain"
          )}
        >
          {messages.length === 0 && !thinking && (
            <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-4 text-sm text-muted-foreground leading-relaxed animate-fade-in">
              {WELCOME}
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2.5 animate-fade-in",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  msg.role === "user" ? "bg-secondary" : "bg-primary/15"
                )}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <MessageCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted/60 border border-border/50 rounded-bl-sm"
                )}
              >
                <ChatMessageBody content={msg.content} />
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-2.5 pl-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <MessageCircle className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border/50 bg-muted/40 px-4 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-2 sm:px-5">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-foreground active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {error && <p className="px-4 pb-2 text-xs text-destructive sm:px-5">{error}</p>}

        <div className="border-t border-border/60 bg-background/60 backdrop-blur-sm safe-bottom shrink-0">
          <button
            type="button"
            onClick={() => setShowResume((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Paste resume snippet (optional)
            </span>
            {showResume ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showResume && (
            <div className="px-4 pb-3 space-y-2 animate-fade-in">
              <Textarea
                value={resumeDraft}
                onChange={(e) => setResumeDraft(e.target.value)}
                placeholder="Paste experience, skills, projects from your resume…"
                className="min-h-[100px] text-base md:text-sm rounded-xl resize-none overscroll-y-contain"
              />
              <Button size="sm" variant="secondary" className="rounded-lg" onClick={saveResumeDraft}>
                Use for matching
              </Button>
            </div>
          )}
          <form onSubmit={onSubmit} className="flex gap-2 p-4 pt-0 sm:p-5 sm:pt-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your ideal role, salary, stack…"
              disabled={thinking}
              className="rounded-xl h-11 bg-muted/40 border-border/60 focus-visible:ring-primary/30"
            />
            <Button
              type="submit"
              size="icon"
              disabled={thinking || !input.trim()}
              className="shrink-0 h-11 w-11 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function MentorJobCard({
  job,
  index,
  onTrack,
  compact,
}: {
  job: DiscoveredJob;
  index: number;
  onTrack: (job: DiscoveredJob) => void;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "surface-interactive opacity-0 animate-fade-in h-full flex flex-col",
        compact ? "p-3.5 rounded-2xl" : "p-4 sm:p-5",
        index === 0 && "stagger-1",
        index === 1 && "stagger-2",
        index === 2 && "stagger-3",
        index === 3 && "stagger-4",
        index >= 4 && "stagger-5"
      )}
      style={{ animationFillMode: "forwards" }}
    >
      <div className={cn("flex gap-3", compact && "flex-col")}>
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
          <span className="text-lg font-bold tabular-nums">{Math.round(job.match_score)}</span>
          <span className="text-[9px] uppercase opacity-70">fit</span>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold leading-tight truncate">{job.role}</h3>
              <p className="text-sm text-muted-foreground truncate">{job.company}</p>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0">
              {job.source}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {job.salary_min_lpa}–{job.salary_max_lpa} LPA · {job.location}
          </p>
          {job.match_reasons[0] && !compact && (
            <p className="text-[11px] text-primary/90 italic line-clamp-2">{job.match_reasons[0]}</p>
          )}
          <div className={cn("flex flex-wrap gap-2 pt-1", compact && "gap-1.5")}>
            <Button size="sm" className={compact ? "h-8 text-xs px-2.5" : undefined} onClick={() => onTrack(job)}>
              <Briefcase className="h-3.5 w-3.5" />
              Track
            </Button>
            <Button size="sm" variant="outline" className={compact ? "h-8 text-xs px-2.5" : undefined} asChild>
              <a href={job.job_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Apply
              </a>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
