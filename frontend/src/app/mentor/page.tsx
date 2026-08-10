"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { isAbortError, useLatestRequest } from "@/lib/use-latest-request";
import { useProfileStore } from "@/stores/profile-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [currentLevel, setCurrentLevel] = useState(profile.currentLevel);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [skills, setSkills] = useState(profile.skills);
  const [years, setYears] = useState(profile.yearsExperience);
  const [resumeExcerpt, setResumeExcerpt] = useState(profile.resumeExcerpt);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const { signal, isCurrent } = latest.begin();
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
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

    // Single chat request (no stream→chat double-hit) — saves free-tier quota & latency
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

  const startSession = () => {
    setMessages([]);
    setInput(
      `I'm currently at ${currentLevel}, aiming for ${targetRole}. Assess me and give a directed learning + interview plan.`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Career Staff
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Conversational Gemini mentor that assesses your level and coaches you toward your target role — with streaming replies.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base">Your profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Current level</Label>
              <Input value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Target role</Label>
              <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Years</Label>
              <Input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Skills</Label>
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Load resume text (optional)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
                rows={5}
                value={resumeExcerpt}
                onChange={(e) => setResumeExcerpt(e.target.value)}
                placeholder="Paste or load resume context for better coaching..."
                className="text-xs"
              />
            </div>
            <Button variant="outline" className="w-full" onClick={startSession}>
              <Sparkles className="h-4 w-4" />
              Prefill assessment prompt
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col max-xl:min-h-0 min-h-[560px]">
          <CardHeader className="border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Mentor chat</span>
              {streaming && <Badge variant="secondary">Streaming…</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col p-0 max-xl:flex-none xl:flex-1">
            <div className="p-4 space-y-4 max-xl:overflow-visible xl:flex-1 xl:overflow-y-auto xl:max-h-[420px] touch-scroll">
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground p-4 rounded-lg bg-muted/40">
                  Ask things like: “I’m mid-level React — how do I reach Senior Full Stack in 8 weeks?”
                  or “Quiz me on system design for my level.”
                </div>
              )}
              {messages.map((m, idx) => (
                <div
                  key={`${m.role}-${idx}`}
                  className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 border border-border"
                    }`}
                  >
                    {m.content || (streaming ? "…" : "")}
                  </div>
                  {m.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={send} className="border-t p-4 flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Talk to your AI career staff..."
                rows={2}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <Button type="submit" disabled={streaming || !input.trim()} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
