"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ExternalLink,
  FileText,
  MessageCircle,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { isAbortError, useLatestRequest } from "@/lib/use-latest-request";
import { useProfileStore } from "@/stores/profile-store";
import type { DiscoveredJob, JobMentorChatResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const STARTERS = [
  "What fits my resume best around 15 LPA?",
  "I want fully remote — what should I target?",
  "Show me strong React roles in Bangalore",
];

interface JobMentorChatProps {
  onJobsUpdate: (jobs: DiscoveredJob[], total: number) => void;
  onTrack: (job: DiscoveredJob) => void;
}

export function JobMentorChat({ onJobsUpdate, onTrack }: JobMentorChatProps) {
  const profile = useProfileStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchSummary, setSearchSummary] = useState("");
  const [resumeInsight, setResumeInsight] = useState<string | null>(null);
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
        }
      })
      .catch(() => undefined);
    // Only re-run when resume id changes
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

  const callMentor = useCallback(
    async (history: ChatMessage[], signal?: AbortSignal) => {
      const res = await api.post<JobMentorChatResponse>(
        "/job-mentor/chat",
        buildPayload(history),
        { signal }
      );
      setSearchSummary(res.search_summary);
      setResumeInsight(res.resume_insight);
      onJobsUpdate(res.jobs, res.total_matches);
      return res.reply;
    },
    [buildPayload, onJobsUpdate]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    const { signal, isCurrent } = latest.begin();
    (async () => {
      try {
        const reply = await callMentor([], signal);
        if (!isCurrent()) return;
        setMessages([{ role: "assistant", content: reply }]);
      } catch (err) {
        if (!isAbortError(err) && isCurrent()) {
          setError(err instanceof ApiError ? err.message : "Could not reach job mentor");
        }
      } finally {
        if (isCurrent()) setBooting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const hasResume = profile.resumeExcerpt.trim().length >= 40;

  return (
    <div className="surface-elevated overflow-hidden flex flex-col h-full min-h-[min(56vh,480px)]">
      <div className="border-b border-border/60 px-4 py-4 sm:px-6 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-semibold text-base">Job mentor</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg leading-relaxed">
              Natural language search — salary, remote, stack. Resume-aware matching.
            </p>
          </div>
          <Badge
            variant={hasResume ? "default" : "outline"}
            className="shrink-0 text-[10px] gap-1 rounded-full"
          >
            <FileText className="h-3 w-3" />
            {hasResume ? "Resume on" : "No resume"}
          </Badge>
        </div>
        {(searchSummary || resumeInsight) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchSummary && (
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                {searchSummary}
              </span>
            )}
            {resumeInsight && (
              <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                {resumeInsight}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-y-auto touch-scroll px-4 py-5 sm:px-6 space-y-4 scrollbar-thin">
            {booting && (
              <p className="text-sm text-muted-foreground animate-pulse">Getting context…</p>
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
                  {msg.content}
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

          {!booting && messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2 sm:px-5">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p className="px-4 pb-2 text-xs text-destructive sm:px-5">{error}</p>
          )}

          <form
            onSubmit={onSubmit}
            className="flex gap-2 border-t border-border/60 p-4 sm:p-5 bg-background/60 backdrop-blur-sm"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                hasResume
                  ? "e.g. remote fintech, 18 LPA, leans on my React work…"
                  : "Tell me what you're hunting for…"
              }
              disabled={thinking || booting}
              className="rounded-xl h-11 bg-muted/40 border-border/60 focus-visible:ring-primary/30"
            />
            <Button
              type="submit"
              size="icon"
              disabled={thinking || booting || !input.trim()}
              className="shrink-0 h-11 w-11 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
    </div>
  );
}

export function MentorJobCard({
  job,
  index,
  onTrack,
}: {
  job: DiscoveredJob;
  index: number;
  onTrack: (job: DiscoveredJob) => void;
}) {
  return (
    <article
      className={cn(
        "surface-interactive p-4 sm:p-5 opacity-0 animate-fade-in h-full flex flex-col",
        index === 0 && "stagger-1",
        index === 1 && "stagger-2",
        index === 2 && "stagger-3",
        index === 3 && "stagger-4",
        index >= 4 && "stagger-5"
      )}
      style={{ animationFillMode: "forwards" }}
    >
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
          <span className="text-lg font-bold tabular-nums">{Math.round(job.match_score)}</span>
          <span className="text-[9px] uppercase opacity-70">fit</span>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold leading-tight">{job.role}</h3>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {job.source}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {job.salary_min_lpa}–{job.salary_max_lpa} LPA · {job.location} · {job.work_mode}
          </p>
          {job.match_reasons[0] && (
            <p className="text-[11px] text-primary/90 italic">{job.match_reasons[0]}</p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={() => onTrack(job)}>
              <Briefcase className="h-3.5 w-3.5" />
              Track
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={job.job_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Apply
              </a>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/jd-analysis?prefill=${encodeURIComponent(job.description)}`}>
                <Sparkles className="h-3.5 w-3.5" />
                Deep match
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
