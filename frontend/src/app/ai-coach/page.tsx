"use client";

import { useState } from "react";
import { Sparkles, FileText, Lightbulb } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/shared/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResumeCoachResponse {
  summary: string;
  strengths: string[];
  gaps: string[];
  bullet_rewrites: string[];
  keywords_to_add: string[];
  ats_tips: string[];
}

interface CareerInsightsResponse {
  headline: string;
  insights: string[];
  next_actions: string[];
  skill_gaps: string[];
  learning_plan: string[];
}

export default function AICoachPage() {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Senior Full Stack Developer");
  const [jobDescription, setJobDescription] = useState("");
  const [years, setYears] = useState(4);
  const [skills, setSkills] = useState(
    "TypeScript, React, Next.js, Node.js, Python, FastAPI, PostgreSQL, AWS, Docker"
  );
  const [resumeResult, setResumeResult] = useState<ResumeCoachResponse | null>(null);
  const [insights, setInsights] = useState<CareerInsightsResponse | null>(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coachResume = async () => {
    setError(null);
    setLoadingResume(true);
    try {
      const data = await api.post<ResumeCoachResponse>("/resume-coach", {
        resume_text: resumeText,
        target_role: targetRole,
        job_description: jobDescription,
        years_experience: years,
      });
      setResumeResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Resume coaching failed");
    } finally {
      setLoadingResume(false);
    }
  };

  const loadInsights = async () => {
    setError(null);
    setLoadingInsights(true);
    try {
      const data = await api.post<CareerInsightsResponse>("/career-insights", {
        user_skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        target_role: targetRole,
      });
      setInsights(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Career insights failed");
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Gemini AI Coach
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Live Google Gemini coaching for resumes and career strategy — nothing templated.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs defaultValue="resume">
        <TabsList>
          <TabsTrigger value="resume">Resume Coach</TabsTrigger>
          <TabsTrigger value="career">Career Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Paste resume content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Target role</Label>
                  <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Years of experience</Label>
                  <Input
                    type="number"
                    min={0}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Optional target JD</Label>
                <Textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste a JD to tailor the resume against it..."
                />
              </div>
              <div className="space-y-2">
                <Label>Resume text</Label>
                <Textarea
                  rows={12}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your full resume text here..."
                  className="font-mono text-xs"
                />
              </div>
              <Button onClick={coachResume} disabled={loadingResume || resumeText.length < 20}>
                <Sparkles className="h-4 w-4" />
                {loadingResume ? "Coaching with Gemini..." : "Coach my resume"}
              </Button>
            </CardContent>
          </Card>

          {loadingResume ? (
            <PageLoading />
          ) : resumeResult ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">{resumeResult.summary}</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Keywords to add</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {resumeResult.keywords_to_add.map((k) => (
                    <Badge key={k} variant="secondary">{k}</Badge>
                  ))}
                </CardContent>
              </Card>
              <ListCard title="Strengths" items={resumeResult.strengths} />
              <ListCard title="Gaps" items={resumeResult.gaps} />
              <ListCard title="Bullet rewrites" items={resumeResult.bullet_rewrites} wide />
              <ListCard title="ATS tips" items={resumeResult.ats_tips} />
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="career" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Generate strategy from your pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your skills</Label>
                <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Target role</Label>
                <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
              </div>
              <Button onClick={loadInsights} disabled={loadingInsights}>
                <Sparkles className="h-4 w-4" />
                {loadingInsights ? "Analyzing with Gemini..." : "Get AI career insights"}
              </Button>
            </CardContent>
          </Card>

          {loadingInsights ? (
            <PageLoading />
          ) : insights ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-lg font-medium">{insights.headline}</p>
                </CardContent>
              </Card>
              <div className="grid gap-4 lg:grid-cols-2">
                <ListCard title="Insights" items={insights.insights} />
                <ListCard title="Next actions" items={insights.next_actions} />
                <ListCard title="Skill gaps" items={insights.skill_gaps} />
                <ListCard title="Learning plan" items={insights.learning_plan} />
              </div>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ListCard({
  title,
  items,
  wide = false,
}: {
  title: string;
  items: string[];
  wide?: boolean;
}) {
  return (
    <Card className={wide ? "lg:col-span-2" : undefined}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="leading-relaxed">• {item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
