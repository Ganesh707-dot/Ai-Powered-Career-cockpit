"use client";

import { useState } from "react";
import { Brain, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import type { JDAnalysisResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageLoading } from "@/components/shared/loading-spinner";

export default function JDAnalysisPage() {
  const [jd, setJd] = useState("");
  const [userSkills, setUserSkills] = useState(
    "JavaScript, TypeScript, React, Next.js, Node.js, Python, FastAPI, SQL, MongoDB, AWS, Docker, Git"
  );
  const [result, setResult] = useState<JDAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (jd.length < 10) return;
    setLoading(true);
    try {
      const data = await api.post<JDAnalysisResponse>("/jd-analysis", {
        job_description: jd,
        user_skills: userSkills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-primary" />
              Paste Job Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={14}
              className="font-mono text-xs"
            />
            <div className="space-y-2">
              <Label>Your Skills (comma-separated)</Label>
              <Input
                value={userSkills}
                onChange={(e) => setUserSkills(e.target.value)}
              />
            </div>
            <Button onClick={analyze} disabled={loading || jd.length < 10} className="w-full">
              <Sparkles className="h-4 w-4" />
              {loading ? "Analyzing..." : "Analyze Job Description"}
            </Button>
          </CardContent>
        </Card>

        {loading ? (
          <PageLoading />
        ) : result ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
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
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{result.match_score}%</p>
                    <p className="text-xs text-muted-foreground">Match Score</p>
                  </div>
                </div>
                <Progress value={result.match_score} className="mt-4 h-2" />
              </CardContent>
            </Card>

            <SkillSection title="Technical Skills" skills={result.technical_skills} />
            <SkillSection title="Databases" skills={result.databases} />
            <SkillSection title="Cloud" skills={result.cloud} />
            <SkillSection title="DevOps" skills={result.devops} />
            <SkillSection title="Soft Skills" skills={result.soft_skills} variant="secondary" />

            {result.strength_areas.length > 0 && (
              <ListSection title="Strength Areas" items={result.strength_areas} color="text-emerald-400" />
            )}
            {result.missing_skills.length > 0 && (
              <ListSection title="Missing Skills" items={result.missing_skills} color="text-amber-400" />
            )}
            <ListSection title="Resume Suggestions" items={result.resume_suggestions} />
            <ListSection title="Interview Focus Topics" items={result.interview_focus_topics} />
            <ListSection title="Learning Recommendations" items={result.learning_recommendations} />
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Brain className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Paste a job description and click analyze to see insights
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
