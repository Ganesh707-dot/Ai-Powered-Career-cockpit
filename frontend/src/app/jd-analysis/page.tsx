"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, Sparkles, FileText } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { isAbortError, useLatestRequest } from "@/lib/use-latest-request";
import { useProfileStore } from "@/stores/profile-store";
import type { JDAnalysisResponse, Resume, ResumeListResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageLoading } from "@/components/shared/loading-spinner";
import { AiStatusBar } from "@/components/shared/ai-status-bar";

export default function JDAnalysisPage() {
  const profile = useProfileStore();
  const [jd, setJd] = useState("");
  const [userSkills, setUserSkills] = useState(profile.skills);
  const [resumeText, setResumeText] = useState(profile.resumeExcerpt);
  const [selectedResumeId, setSelectedResumeId] = useState(
    profile.resumeId ? String(profile.resumeId) : ""
  );
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [result, setResult] = useState<JDAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const latest = useLatestRequest();

  useEffect(() => {
    setUserSkills(profile.skills);
    setResumeText(profile.resumeExcerpt);
    setSelectedResumeId(profile.resumeId ? String(profile.resumeId) : "");
  }, [profile.skills, profile.resumeExcerpt, profile.resumeId]);

  const hasProfile =
    userSkills.split(",").map((s) => s.trim()).filter(Boolean).length > 0 ||
    resumeText.trim().length >= 40;

  useEffect(() => {
    api
      .get<ResumeListResponse>("/resumes")
      .then((data) => setResumes(data.items))
      .catch(() => undefined);
  }, []);

  const loadResume = async (id: string) => {
    setSelectedResumeId(id);
    if (!id) {
      setResumeText("");
      profile.setResume(null, "", "");
      return;
    }
    const resume = resumes.find((r) => String(r.id) === id);
    if (resume?.skills_highlighted) {
      setUserSkills(resume.skills_highlighted);
      profile.setSkills(resume.skills_highlighted);
    }
    if (resume?.has_extracted_text) {
      try {
        const data = await api.get<{ extracted_text: string }>(`/resumes/${id}/text`);
        const excerpt = data.extracted_text.slice(0, 5000);
        setResumeText(excerpt);
        profile.setResume(resume.id, resume.name, excerpt);
        if (resume.target_role) {
          profile.setProfile({ targetRole: resume.target_role });
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not load resume text");
      }
    } else if (resume) {
      setResumeText("");
      profile.setResume(resume.id, resume.name, "");
      setError(
        "Selected resume has no file text. Upload PDF/TXT on Resumes, or type skills in your profile."
      );
    }
  };

  const analyze = async () => {
    if (jd.length < 10) return;
    if (!hasProfile) {
      setError(
        "Add skills in your profile (header) or select a resume. Match % needs a real candidate profile."
      );
      return;
    }

    // Keep profile in sync with what user typed here
    profile.setSkills(userSkills);
    if (resumeText) {
      profile.setResume(
        selectedResumeId ? Number(selectedResumeId) : profile.resumeId,
        profile.resumeName,
        resumeText
      );
    }

    const { signal, isCurrent } = latest.begin();
    setLoading(true);
    setError(null);
    setResult(null);
    const started = performance.now();
    try {
      const data = await api.post<JDAnalysisResponse>(
        "/jd-analysis",
        {
          job_description: jd,
          user_skills: userSkills.split(",").map((s) => s.trim()).filter(Boolean),
          resume_text: resumeText,
          target_role: profile.targetRole,
          years_experience: profile.yearsExperience,
        },
        { signal }
      );
      if (!isCurrent()) return;
      setResult(data);
      setElapsedMs(Math.round(performance.now() - started));
    } catch (err) {
      if (isAbortError(err) || !isCurrent()) return;
      setError(err instanceof ApiError ? err.message : "Gemini JD analysis failed");
    } finally {
      if (isCurrent()) setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        <strong className="text-foreground">Personalized match:</strong> score compares{" "}
        <em>your saved profile / resume</em> to this JD — not a random guess.{" "}
        {!hasProfile && (
          <span className="text-amber-400"> Set profile in the header first.</span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-primary" />
              Job description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={10}
              className="font-mono text-xs"
            />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Resume for this match
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={selectedResumeId}
                onChange={(e) => loadResume(e.target.value)}
              >
                <option value="">Use profile skills only</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                    {r.has_extracted_text ? " (file ready)" : " (metadata only)"}
                  </option>
                ))}
              </select>
              {resumes.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  <Link href="/resumes" className="text-primary underline">
                    Upload a resume
                  </Link>{" "}
                  for deeper matching.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Your skills *</Label>
              <Input
                value={userSkills}
                onChange={(e) => setUserSkills(e.target.value)}
                placeholder="From your profile — edit anytime"
              />
            </div>

            {resumeText && (
              <p className="text-xs text-emerald-400">
                Resume context loaded ({resumeText.length} chars)
              </p>
            )}

            <Button
              onClick={analyze}
              disabled={loading || jd.length < 10 || !hasProfile}
              className="w-full"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Scoring latest JD…" : "Get personalized match"}
            </Button>
            <AiStatusBar
              loading={loading}
              label="Personalized JD analysis…"
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
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {result.role || "Role Analysis"}
                    </h3>
                    {result.company && (
                      <p className="text-sm text-muted-foreground">{result.company}</p>
                    )}
                    {result.experience && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Experience: {result.experience}
                      </p>
                    )}
                  </div>
                  <div className="text-center min-w-[96px]">
                    {result.match_available && result.match_score != null ? (
                      <>
                        <p className="text-3xl font-bold text-primary">
                          {result.match_score}%
                        </p>
                        <p className="text-xs text-muted-foreground">Your match</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-muted-foreground">N/A</p>
                        <p className="text-xs text-muted-foreground">No profile</p>
                      </>
                    )}
                  </div>
                </div>
                {result.match_available && result.match_score != null ? (
                  <Progress value={result.match_score} className="mt-4 h-2" />
                ) : null}
                {result.match_note && (
                  <p className="mt-3 text-xs text-muted-foreground">{result.match_note}</p>
                )}
              </CardContent>
            </Card>

            <SkillSection title="Technical Skills" skills={result.technical_skills} />
            <SkillSection title="Databases" skills={result.databases} />
            <SkillSection title="Cloud" skills={result.cloud} />
            <SkillSection title="DevOps" skills={result.devops} />
            <SkillSection title="Soft Skills" skills={result.soft_skills} variant="secondary" />
            {result.strength_areas.length > 0 && (
              <ListSection title="Your strengths for this JD" items={result.strength_areas} color="text-emerald-400" />
            )}
            {result.missing_skills.length > 0 && (
              <ListSection title="Gaps to close" items={result.missing_skills} color="text-amber-400" />
            )}
            <ListSection title="Resume suggestions" items={result.resume_suggestions} />
            <ListSection title="Interview focus" items={result.interview_focus_topics} />
            <ListSection title="Learning next" items={result.learning_recommendations} />
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Brain className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground max-w-sm">
                Set profile → paste JD → get a match score tailored to you
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SkillSection({
  title,
  skills,
  variant = "default",
}: {
  title: string;
  skills: string[];
  variant?: "default" | "secondary";
}) {
  if (skills.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <Badge key={skill} variant={variant}>
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ListSection({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color?: string;
}) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className={`text-sm ${color || "text-muted-foreground"}`}>
              • {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
