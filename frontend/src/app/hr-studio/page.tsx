"use client";

import { useEffect, useState } from "react";
import { Copy, MessageSquare, Check } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { isAbortError, useLatestRequest } from "@/lib/use-latest-request";
import { useProfileStore } from "@/stores/profile-store";
import type { HRAnswerResponse, HRQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoading } from "@/components/shared/loading-spinner";
import { AiStatusBar } from "@/components/shared/ai-status-bar";

const FALLBACK_HR: HRQuestion[] = [
  { key: "tell_me_about_yourself", question: "Tell me about yourself." },
  { key: "why_this_company", question: "Why do you want to join this company?" },
  { key: "why_leave", question: "Why are you leaving your current role?" },
  { key: "strengths", question: "What are your greatest strengths?" },
  { key: "weaknesses", question: "What is your biggest weakness?" },
  { key: "leadership", question: "Describe your leadership experience." },
  { key: "conflict_resolution", question: "How do you handle conflict with a colleague?" },
  { key: "career_goals", question: "What are your career goals?" },
  { key: "salary_expectations", question: "What are your salary expectations?" },
];

export default function HRStudioPage() {
  const profile = useProfileStore();
  const [questions, setQuestions] = useState<HRQuestion[]>(FALLBACK_HR);
  const [selectedKey, setSelectedKey] = useState(FALLBACK_HR[0].key);
  const [userExperience, setUserExperience] = useState(
    profile.resumeExcerpt.slice(0, 400) || profile.skills
  );
  const [yearsExperience, setYearsExperience] = useState(profile.yearsExperience);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [company, setCompany] = useState("");
  const [result, setResult] = useState<HRAnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const latest = useLatestRequest();

  useEffect(() => {
    setYearsExperience(profile.yearsExperience);
    setTargetRole(profile.targetRole);
    if (!userExperience) {
      setUserExperience(profile.resumeExcerpt.slice(0, 400) || profile.skills);
    }
  }, [profile.yearsExperience, profile.targetRole, profile.resumeExcerpt, profile.skills]);

  useEffect(() => {
    setLoadingQuestions(true);
    api
      .get<HRQuestion[]>("/hr-questions")
      .then((qs) => {
        if (qs?.length) {
          setQuestions(qs);
          setSelectedKey((prev) => prev || qs[0].key);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoadingQuestions(false));
  }, []);

  const generate = async () => {
    if (!selectedKey) return;
    const { signal, isCurrent } = latest.begin();
    setLoading(true);
    setError(null);
    setResult(null);
    const started = performance.now();
    try {
      const data = await api.post<HRAnswerResponse>(
        "/hr-answers",
        {
          question_key: selectedKey,
          user_experience: userExperience,
          years_experience: yearsExperience,
          target_role: targetRole,
          company,
          fast_mode: true,
        },
        { signal }
      );
      if (!isCurrent()) return;
      setResult(data);
      setElapsedMs(Math.round(performance.now() - started));
    } catch (err) {
      if (isAbortError(err) || !isCurrent()) return;
      setError(err instanceof ApiError ? err.message : "Gemini HR generation failed");
    } finally {
      if (isCurrent()) setLoading(false);
    }
  };

  const copyAnswer = (style: string, answer: string) => {
    navigator.clipboard.writeText(answer);
    setCopied(style);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-primary" />
              Gemini HR Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {loadingQuestions ? (
              <p className="text-sm text-muted-foreground px-3 py-2">Loading from Gemini...</p>
            ) : (
              questions.map((q) => (
                <button
                  key={q.key}
                  onClick={() => {
                    setSelectedKey(q.key);
                    setResult(null);
                  }}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    selectedKey === q.key
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {q.question}
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Target Role</Label>
                  <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Target Company</Label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Your Real Experience (used to personalize answers)</Label>
                  <Textarea
                    value={userExperience}
                    onChange={(e) => setUserExperience(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <Button onClick={generate} disabled={loading || !selectedKey}>
                {loading ? "Generating latest…" : "Generate with Gemini AI"}
              </Button>
              <AiStatusBar
                loading={loading}
                label="Latest HR answers…"
                elapsedMs={elapsedMs}
                onCancel={() => {
                  latest.cancel();
                  setLoading(false);
                }}
              />
            </CardContent>
          </Card>

          {loading ? (
            <PageLoading />
          ) : result ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{result.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={result.answers[0]?.style}>
                  <TabsList>
                    {result.answers.map((a) => (
                      <TabsTrigger key={a.style} value={a.style} className="capitalize">
                        {a.style}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {result.answers.map((a) => (
                    <TabsContent key={a.style} value={a.style}>
                      <div className="relative rounded-lg border border-border bg-muted/30 p-4">
                        <p className="text-sm leading-relaxed pr-8">{a.answer}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => copyAnswer(a.style, a.answer)}
                        >
                          {copied === a.style ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
