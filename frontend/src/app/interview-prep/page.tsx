"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Mic, RefreshCw, Target } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { isAbortError, useLatestRequest } from "@/lib/use-latest-request";
import { useProfileStore } from "@/stores/profile-store";
import type { InterviewPrepResponse, InterviewQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AiStatusBar } from "@/components/shared/ai-status-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const FALLBACK_CATEGORIES = [
  "HR",
  "Behavioral",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "System Design",
  "Databases",
  "REST APIs",
  "Performance",
  "Security",
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-emerald-500/20 text-emerald-300",
  Medium: "bg-amber-500/20 text-amber-300",
  Hard: "bg-red-500/20 text-red-300",
};

interface MockResult {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  better_answer: string;
}

export default function InterviewPrepPage() {
  const profile = useProfileStore();
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("React");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [count, setCount] = useState("3");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState(profile.targetRole);
  const [skills, setSkills] = useState(profile.skills);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [queryLabel, setQueryLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("generate");
  const prepReq = useLatestRequest();

  const [drillQ, setDrillQ] = useState("");
  const [drillA, setDrillA] = useState("");
  const [mockLoading, setMockLoading] = useState(false);
  const [mockResult, setMockResult] = useState<MockResult | null>(null);
  const [mockElapsed, setMockElapsed] = useState<number | null>(null);
  const mockReq = useLatestRequest();

  useEffect(() => {
    setRole(profile.targetRole);
    setSkills(profile.skills);
  }, [profile.targetRole, profile.skills]);

  useEffect(() => {
    // Instant categories; refresh from API without blocking UI
    api
      .get<string[]>("/interview-categories")
      .then((cats) => {
        if (cats?.length) setCategories(cats);
      })
      .catch(() => undefined);
  }, []);

  const generate = async () => {
    const { signal, isCurrent, abort } = prepReq.begin();
    void abort;
    setLoading(true);
    setError(null);
    setQuestions([]);
    setExpanded(null);
    const started = performance.now();
    const label = [company, role, skills, selectedCategory, difficulty]
      .filter(Boolean)
      .join(" · ");
    setQueryLabel(label);

    try {
      const data = await api.post<InterviewPrepResponse>(
        "/interview-prep",
        {
          company,
          role,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          categories: selectedCategory === "all" ? [] : [selectedCategory],
          count: Number(count) || 6,
          difficulty,
          fast_mode: true,
        },
        { signal }
      );
      if (!isCurrent()) return;
      setQuestions(data.questions);
      setElapsedMs(Math.round(performance.now() - started));
    } catch (err) {
      if (isAbortError(err) || !isCurrent()) return;
      setError(err instanceof ApiError ? err.message : "Gemini interview prep failed");
    } finally {
      if (isCurrent()) setLoading(false);
    }
  };

  const evaluateAnswer = async () => {
    if (!drillQ.trim() || !drillA.trim()) return;
    const { signal, isCurrent } = mockReq.begin();
    setMockLoading(true);
    setMockResult(null);
    setError(null);
    const started = performance.now();
    try {
      const data = await api.post<MockResult>(
        "/mock-interview",
        {
          question: drillQ,
          answer: drillA,
          role: role || "Software Engineer",
          company,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        },
        { signal }
      );
      if (!isCurrent()) return;
      setMockResult(data);
      setMockElapsed(Math.round(performance.now() - started));
    } catch (err) {
      if (isAbortError(err) || !isCurrent()) return;
      setError(err instanceof ApiError ? err.message : "Mock interview failed");
    } finally {
      if (isCurrent()) setMockLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="generate">Generate pack</TabsTrigger>
          <TabsTrigger value="drill">Live answer drill</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mic className="h-4 w-4 text-primary" />
                Fast Gemini interview pack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior React Dev"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <Input
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, TypeScript…"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All (top 4)</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Question count</Label>
                  <Select value={count} onValueChange={setCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 (fastest)</SelectItem>
                      <SelectItem value="6">6 (recommended)</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={generate} disabled={loading}>
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  {loading ? "Generating latest…" : "Generate latest pack"}
                </Button>
                <AiStatusBar
                  loading={loading}
                  label="Fetching latest Gemini pack…"
                  elapsedMs={elapsedMs}
                  onCancel={() => {
                    prepReq.cancel();
                    setLoading(false);
                  }}
                />
              </div>
              {queryLabel && !loading && questions.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Showing results for: <span className="text-foreground">{queryLabel}</span>
                </p>
              )}
            </CardContent>
          </Card>

          {loading ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Waiting for the latest request only — older in-flight packs are cancelled.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </p>
              {questions.map((q, i) => (
                <QuestionCard
                  key={`${q.question}-${i}`}
                  question={q}
                  expanded={expanded === i}
                  onToggle={() => setExpanded(expanded === i ? null : i)}
                  onDrill={() => {
                    setDrillQ(q.question);
                    setDrillA("");
                    setMockResult(null);
                    setTab("drill");
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drill" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Live answer drill + AI score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  rows={2}
                  value={drillQ}
                  onChange={(e) => setDrillQ(e.target.value)}
                  placeholder="Paste or pick a generated question…"
                />
              </div>
              <div className="space-y-2">
                <Label>Your answer</Label>
                <Textarea
                  rows={5}
                  value={drillA}
                  onChange={(e) => setDrillA(e.target.value)}
                  placeholder="Type how you would answer in the interview…"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={evaluateAnswer}
                  disabled={mockLoading || drillQ.length < 5 || drillA.length < 5}
                >
                  {mockLoading ? "Scoring latest…" : "Score with Gemini"}
                </Button>
                <AiStatusBar
                  loading={mockLoading}
                  label="Evaluating latest answer…"
                  elapsedMs={mockElapsed}
                  onCancel={() => {
                    mockReq.cancel();
                    setMockLoading(false);
                  }}
                />
              </div>
              {mockResult && (
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-semibold text-primary">{mockResult.score}</p>
                    <p className="text-sm text-muted-foreground">{mockResult.verdict}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-primary mb-1">Strengths</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {mockResult.strengths.map((s) => (
                          <li key={s}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-primary mb-1">Improve</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {mockResult.improvements.map((s) => (
                          <li key={s}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">Stronger answer</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {mockResult.better_answer}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuestionCard({
  question,
  expanded,
  onToggle,
  onDrill,
}: {
  question: InterviewQuestion;
  expanded: boolean;
  onToggle: () => void;
  onDrill: () => void;
}) {
  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={onToggle}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{question.category}</Badge>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium",
                  DIFFICULTY_COLORS[question.difficulty]
                )}
              >
                {question.difficulty}
              </span>
            </div>
            <p className="text-sm font-medium">{question.question}</p>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </div>
        {expanded && (
          <div className="mt-4 space-y-3 border-t border-border pt-4 animate-fade-in">
            <div>
              <p className="text-xs font-medium text-primary mb-1">Expected Answer</p>
              <p className="text-sm text-muted-foreground">{question.expected_answer}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-primary mb-1">Evaluation Criteria</p>
              <p className="text-sm text-muted-foreground">{question.evaluation_criteria}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onDrill();
              }}
            >
              Practice this in Live drill
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
