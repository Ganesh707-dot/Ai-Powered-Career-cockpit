"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, ChevronUp, Send, Sparkles, User } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { isAbortError, useLatestRequest } from "@/lib/use-latest-request";
import { useProfileStore } from "@/stores/profile-store";
import { ChatMessageBody } from "@/components/cockpit/job-mentor-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ResumeListItem {
  id: number;
  name: string;
  has_extracted_text?: boolean;
}

export default function MentorPage() {
  const profile = useProfileStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(profile.currentLevel);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [skills, setSkills] = useState(profile.skills);
  const [years, setYears] = useState(profile.yearsExperience);
  const [resumeExcerpt, setResumeExcerpt] = useState(profile.resumeExcerpt);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);
  const latest = useLatestRequest();

  useEffect(() => {
    setCurrentLevel(profile.currentLevel);
    setTargetRole(profile.targetRole);
    setSkills(profile.skills);
    setYears(profile.yearsExperience);
    setResumeExcerpt(profile.resumeExcerpt);
  }, [profile.currentLevel, profile.targetRole, profile.skills, profile.yearsExperience, profile.resumeExcerpt]);

  useEffect(() => {
    api
      .get<{ items: ResumeListItem[] }>("/resumes")
      .then((data) => setResumes(data.items))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      messageCountRef.current = 0;
      return;
    }
    if (messages.length <= messageCountRef.current && !streaming) return;
    messageCountRef.current = messages.length;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, streaming]);

  const loadResume = async (id: string) => {
    if (!id) return;
    try {
      const data = await api.get<{ extracted_text: string }>(`/resumes/${id}/text`);
      setResumeExcerpt(data.extracted_text.slice(0, 3000));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load resume text");
    }
  };

  const send = async (
    e?: FormEvent,
    overrideText?: string,
    freshSession = false
  ) => {
    e?.preventDefault();
    const text = (overrideText ?? input).trim();
    if (!text || streaming) return;

    const { signal, isCurrent } = latest.begin();
    const base = freshSession ? [] : messages;
    const nextMessages: ChatMessage[] = [...base, { role: "user", content: text }];
    setMessages(nextMessages);
    if (!overrideText) setInput("");
    setStreaming(true);
    setError(null);

    const payload = {
      messages: nextMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      current_level: currentLevel,
      target_role: targetRole,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      years_experience: years,
      resume_excerpt: resumeExcerpt,
    };
    profile.setProfile({
      currentLevel,
      targetRole,
      skills,
      yearsExperience: years,
      resumeExcerpt,
    });

    setMessages((prev) => [...prev, { role: "assistant", content: "Thinking…" }]);

    try {
      const res = await api.post<{ reply: string }>("/mentor/chat", payload, { signal });
      if (!isCurrent()) return;
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: res.reply };
        return copy;
      });
    } catch (err) {
      if (isAbortError(err) || !isCurrent()) return;
      const message =
        err instanceof ApiError
          ? err.message
          : "Mentor failed. If you see rate limit, wait ~40s and retry.";
      setError(message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      if (isCurrent()) setStreaming(false);
    }
  };

  const startSession = async () => {
    const prompt = `I'm currently at ${currentLevel}, aiming for ${targetRole}. Assess me and give a directed learning + interview plan.`;
    setError(null);
    setInput("");
    await send(undefined, prompt, true);
  };

  return (
    <div className="space-y-4 xl:space-y-6 animate-fade-in pb-4">
      <div className="hidden xl:block">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Career Staff
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Conversational Gemini mentor that assesses your level and coaches you toward your target role.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 xl:gap-6 lg:grid-cols-3">
        {/* Chat first on mobile — primary tab surface */}
        <Card className="lg:col-span-2 order-1 lg:order-2 flex flex-col max-xl:rounded-2xl xl:min-h-[560px]">
          <CardHeader className="border-b py-3 xl:py-4">
            <CardTitle className="text-base flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <MessageCircleIcon />
                Mentor chat
              </span>
              {streaming && <Badge variant="secondary">Thinking…</Badge>}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 xl:hidden">
              Career coaching from your level to target role
            </p>
          </CardHeader>
          <CardContent className="flex flex-col p-0">
            <div className="p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground p-4 rounded-xl bg-muted/40 leading-relaxed">
                  Ask things like: “I’m mid-level React — how do I reach Senior Full Stack in 8 weeks?”
                  or “Quiz me on system design for my level.”
                </div>
              )}
              {messages.map((m, idx) => (
                <div
                  key={`${m.role}-${idx}`}
                  className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  {m.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted/50 border border-border rounded-bl-sm"
                    )}
                  >
                    {m.content ? (
                      <ChatMessageBody content={m.content} />
                    ) : streaming ? (
                      "…"
                    ) : null}
                  </div>
                  {m.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} aria-hidden />
            </div>

            <form
              onSubmit={send}
              className="border-t border-border/60 bg-background/80 backdrop-blur-sm p-4 flex gap-2 shrink-0"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Talk to your AI career staff…"
                disabled={streaming}
                className="rounded-xl h-11 bg-muted/40 border-border/60"
              />
              <Button
                type="submit"
                disabled={streaming || !input.trim()}
                size="icon"
                className="shrink-0 h-11 w-11 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Profile context — collapsible on mobile, sidebar on desktop */}
        <Card className="lg:col-span-1 order-2 lg:order-1 h-fit max-xl:rounded-2xl">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 border-b border-border/50 xl:hidden text-left"
            aria-expanded={profileOpen}
          >
            <span className="text-sm font-semibold">Coaching context</span>
            {profileOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </button>
          <CardHeader className="hidden xl:block">
            <CardTitle className="text-base">Your profile</CardTitle>
          </CardHeader>
          <CardContent
            className={cn(
              "space-y-3",
              !profileOpen && "hidden xl:block",
              profileOpen ? "block px-4 pb-4 pt-2 xl:px-6 xl:pb-6" : "xl:px-6 xl:pb-6"
            )}
          >
            <div className="space-y-2">
              <Label>Current level</Label>
              <Input value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Target role</Label>
              <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Years</Label>
                <Input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Skills</Label>
                <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Load resume text (optional)</Label>
              <select
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-base xl:text-sm"
                defaultValue=""
                onChange={(e) => loadResume(e.target.value)}
              >
                <option value="">Select uploaded resume</option>
                {resumes
                  .filter((r) => r.has_extracted_text)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Resume excerpt</Label>
              <Textarea
                rows={4}
                value={resumeExcerpt}
                onChange={(e) => setResumeExcerpt(e.target.value)}
                placeholder="Paste or load resume context for better coaching..."
                className="text-sm resize-none rounded-xl"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl h-11"
              disabled={streaming}
              onClick={() => void startSession()}
            >
              <Sparkles className="h-4 w-4" />
              {streaming ? "Assessing…" : "Run level assessment"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MessageCircleIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
      <Bot className="h-4 w-4 text-primary" />
    </span>
  );
}
