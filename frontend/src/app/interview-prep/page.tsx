"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Mic } from "lucide-react";
import { api } from "@/lib/api";
import type { InterviewPrepResponse, InterviewQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoading } from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-emerald-500/20 text-emerald-300",
  Medium: "bg-amber-500/20 text-amber-300",
  Hard: "bg-red-500/20 text-red-300",
};

export default function InterviewPrepPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("React, TypeScript, Next.js, Node.js");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    api.get<string[]>("/interview-categories").then(setCategories).catch(console.error);
    generate();
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await api.post<InterviewPrepResponse>("/interview-prep", {
        company,
        role,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        categories: selectedCategory === "all" ? [] : [selectedCategory],
      });
      setQuestions(data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    selectedCategory === "all"
      ? questions
      : questions.filter((q) => q.category === selectedCategory);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mic className="h-4 w-4 text-primary" />
            Generate Interview Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior React Dev" />
            </div>
            <div className="space-y-2">
              <Label>Skills</Label>
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generate} disabled={loading} className="mt-4">
            {loading ? "Generating..." : "Generate Questions"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <PageLoading />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} question{filtered.length !== 1 ? "s" : ""}
          </p>
          {filtered.map((q, i) => (
            <QuestionCard
              key={i}
              question={q}
              expanded={expanded === i}
              onToggle={() => setExpanded(expanded === i ? null : i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  question,
  expanded,
  onToggle,
}: {
  question: InterviewQuestion;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="cursor-pointer transition-colors hover:border-primary/30" onClick={onToggle}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
