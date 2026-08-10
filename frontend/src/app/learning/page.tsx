"use client";

import { useEffect, useState } from "react";
import { BookOpen, Pencil, Plus, Trash2, Sparkles } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useProfileStore } from "@/stores/profile-store";
import type {
  LearningCategory,
  LearningTopic,
  LearningTopicListResponse,
  TopicStatus,
} from "@/types";
import { LEARNING_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading-spinner";

const STATUSES: TopicStatus[] = ["Planned", "In Progress", "Completed"];

export default function LearningPage() {
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LearningTopic | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "JavaScript" as LearningCategory,
    status: "Planned" as TopicStatus,
    notes: "",
    resources: "",
  });
  const [pathLoading, setPathLoading] = useState(false);
  const [pathError, setPathError] = useState<string | null>(null);
  const [pathSummary, setPathSummary] = useState<string | null>(null);
  const profile = useProfileStore();
  const [pathForm, setPathForm] = useState({
    current_level: profile.currentLevel,
    target_role: profile.targetRole,
    skills: profile.skills || "React, TypeScript, Next.js, Node.js",
    weeks: 6,
  });

  useEffect(() => {
    setPathForm((f) => ({
      ...f,
      current_level: profile.currentLevel,
      target_role: profile.targetRole,
      skills: profile.skills || f.skills,
    }));
  }, [profile.currentLevel, profile.targetRole, profile.skills]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const data = await api.get<LearningTopicListResponse>("/learning");
      setTopics(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const completed = topics.filter((t) => t.status === "Completed").length;
  const inProgress = topics.filter((t) => t.status === "In Progress").length;
  const progress = topics.length > 0 ? (completed / topics.length) * 100 : 0;

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", category: "JavaScript", status: "Planned", notes: "", resources: "" });
    setDialogOpen(true);
  };

  const openEdit = (topic: LearningTopic) => {
    setEditing(topic);
    setForm({
      title: topic.title,
      category: topic.category,
      status: topic.status,
      notes: topic.notes || "",
      resources: topic.resources || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch(`/learning/${editing.id}`, form);
      } else {
        await api.post("/learning", form);
      }
      setDialogOpen(false);
      fetchTopics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this topic?")) return;
    await api.delete(`/learning/${id}`);
    fetchTopics();
  };

  const updateStatus = async (topic: LearningTopic, status: TopicStatus) => {
    await api.patch(`/learning/${topic.id}`, { status });
    fetchTopics();
  };

  const generatePath = async () => {
    setPathLoading(true);
    setPathError(null);
    try {
      const data = await api.post<{
        headline: string;
        roadmap_summary: string;
        created_topic_ids: number[];
      }>("/learning/generate-path", {
        current_level: pathForm.current_level,
        target_role: pathForm.target_role,
        skills: pathForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
        weeks: pathForm.weeks,
        persist: true,
      });
      setPathSummary(`${data.headline}\n\n${data.roadmap_summary}`);
      await fetchTopics();
    } catch (err) {
      setPathError(err instanceof ApiError ? err.message : "Path generation failed");
    } finally {
      setPathLoading(false);
    }
  };

  const grouped = LEARNING_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = topics.filter((t) => t.category === cat);
      return acc;
    },
    {} as Record<string, LearningTopic[]>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Gemini learning roadmap</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Generate a week-by-week plan from your current level to your target role. Topics are saved into this board.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label>Current level</Label>
              <Input
                value={pathForm.current_level}
                onChange={(e) => setPathForm({ ...pathForm, current_level: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Target role</Label>
              <Input
                value={pathForm.target_role}
                onChange={(e) => setPathForm({ ...pathForm, target_role: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Skills</Label>
              <Input
                value={pathForm.skills}
                onChange={(e) => setPathForm({ ...pathForm, skills: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Weeks</Label>
              <Input
                type="number"
                min={2}
                max={16}
                value={pathForm.weeks}
                onChange={(e) =>
                  setPathForm({ ...pathForm, weeks: Number(e.target.value) || 6 })
                }
              />
            </div>
          </div>
          <Button onClick={generatePath} disabled={pathLoading}>
            <Sparkles className="h-4 w-4" />
            {pathLoading ? "Generating with Gemini…" : "Generate AI learning path"}
          </Button>
          {pathError && <p className="text-sm text-destructive">{pathError}</p>}
          {pathSummary && (
            <pre className="whitespace-pre-wrap text-xs text-muted-foreground rounded-md bg-muted/40 p-3">
              {pathSummary}
            </pre>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{topics.length}</p>
            <p className="text-xs text-muted-foreground">Total Topics</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{inProgress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          Add Topic
        </Button>
      </div>

      {loading ? (
        <PageLoading />
      ) : topics.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No learning topics"
          description="Track your interview preparation topics and progress."
          actionLabel="Add Topic"
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-6">
          {LEARNING_CATEGORIES.map((cat) => {
            const items = grouped[cat];
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-sm font-semibold mb-3">{cat}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {items.map((topic) => (
                    <Card key={topic.id} className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{topic.title}</p>
                            <Select
                              value={topic.status}
                              onValueChange={(v) =>
                                updateStatus(topic, v as TopicStatus)
                              }
                            >
                              <SelectTrigger className="mt-2 h-7 w-auto text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUSES.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(topic)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(topic.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Topic" : "Add Topic"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col min-h-0 overflow-hidden"
          >
            <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v as LearningCategory })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEARNING_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as TopicStatus })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Resources</Label>
              <Input
                value={form.resources}
                onChange={(e) => setForm({ ...form, resources: e.target.value })}
                placeholder="Links, books, courses..."
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>
            </DialogBody>
            <DialogFooter className="modal-footer-stacked">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
