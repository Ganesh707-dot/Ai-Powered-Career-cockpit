"use client";

import { useEffect, useState } from "react";
import { Copy, MessageSquare, Check } from "lucide-react";
import { api } from "@/lib/api";
import type { HRAnswerResponse, HRQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoading } from "@/components/shared/loading-spinner";

export default function HRStudioPage() {
  const [questions, setQuestions] = useState<HRQuestion[]>([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [userExperience, setUserExperience] = useState(
    "I recently led the migration of a legacy Angular application to Next.js, improving page load times by 60% and reducing bundle size by 45%."
  );
  const [yearsExperience, setYearsExperience] = useState(4);
  const [targetRole, setTargetRole] = useState("Senior Full Stack Developer");
  const [company, setCompany] = useState("");
  const [result, setResult] = useState<HRAnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api.get<HRQuestion[]>("/hr-questions").then((qs) => {
      setQuestions(qs);
      if (qs.length > 0) {
        setSelectedKey(qs[0].key);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedKey) generate();
  }, [selectedKey]);

  const generate = async () => {
    if (!selectedKey) return;
    setLoading(true);
    try {
      const data = await api.post<HRAnswerResponse>("/hr-answers", {
        question_key: selectedKey,
        user_experience: userExperience,
        years_experience: yearsExperience,
        target_role: targetRole,
        company,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyAnswer = (style: string, answer: string) => {
    navigator.clipboard.writeText(answer);
    setCopied(style);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-primary" />
              HR Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {questions.map((q) => (
              <button
                key={q.key}
                onClick={() => setSelectedKey(q.key)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  selectedKey === q.key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {q.question}
              </button>
            ))}
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
              <Button onClick={generate} disabled={loading}>
                {loading ? "Generating..." : "Regenerate Answers"}
              </Button>
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
