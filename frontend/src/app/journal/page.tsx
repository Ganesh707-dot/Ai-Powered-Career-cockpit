"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BookOpen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { InterviewJournal, InterviewJournalListResponse } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading-spinner";

const OUTCOMES = ["Pending", "Passed", "Failed", "Offer", "Withdrawn"];

export default function JournalPage() {
  const [entries, setEntries] = useState<InterviewJournal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InterviewJournal | null>(null);

  const form = useForm({
    defaultValues: {
      company: "",
      role: "",
      round: "",
      interviewer: "",
      questions_asked: "",
      my_answers: "",
      better_answers: "",
      feedback: "",
      mistakes: "",
      lessons_learned: "",
      confidence_rating: 5,
      outcome: "Pending",
      interview_date: "",
    },
  });

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await api.get<InterviewJournalListResponse>(`/journal${params}`);
      setEntries(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    form.reset();
    setDialogOpen(true);
  };

  const openEdit = (entry: InterviewJournal) => {
    setEditing(entry);
    form.reset({
      company: entry.company,
      role: entry.role || "",
      round: entry.round,
      interviewer: entry.interviewer || "",
      questions_asked: entry.questions_asked || "",
      my_answers: entry.my_answers || "",
      better_answers: entry.better_answers || "",
      feedback: entry.feedback || "",
      mistakes: entry.mistakes || "",
      lessons_learned: entry.lessons_learned || "",
      confidence_rating: entry.confidence_rating || 5,
      outcome: entry.outcome,
      interview_date: entry.interview_date?.split("T")[0] || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    const payload = {
      ...data,
      confidence_rating: Number(data.confidence_rating),
      interview_date: data.interview_date || null,
    };
    try {
      if (editing) {
        await api.patch(`/journal/${editing.id}`, payload);
      } else {
        await api.post("/journal", payload);
      }
      setDialogOpen(false);
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this journal entry?")) return;
    await api.delete(`/journal/${id}`);
    fetchEntries();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search journal entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          Log Interview
        </Button>
      </div>

      {loading ? (
        <PageLoading />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No journal entries"
          description="Record your interview experiences to build a searchable knowledge base."
          actionLabel="Log Interview"
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{entry.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.round} {entry.role ? `· ${entry.role}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline">{entry.outcome}</Badge>
                </div>
                {entry.lessons_learned && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {entry.lessons_learned}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Confidence: {entry.confidence_rating}/10 ·{" "}
                    {formatDate(entry.interview_date)}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(entry)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Entry" : "Log Interview"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col min-h-0 overflow-hidden"
          >
            <DialogBody>
              <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input {...form.register("company", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Round *</Label>
                <Input {...form.register("round", { required: true })} placeholder="Technical Round 1" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input {...form.register("role")} />
              </div>
              <div className="space-y-2">
                <Label>Interviewer</Label>
                <Input {...form.register("interviewer")} />
              </div>
              <div className="space-y-2">
                <Label>Outcome</Label>
                <Select
                  value={form.watch("outcome")}
                  onValueChange={(v) => form.setValue("outcome", v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OUTCOMES.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Confidence (1-10)</Label>
                <Input type="number" min={1} max={10} {...form.register("confidence_rating")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Interview Date</Label>
                <Input type="date" {...form.register("interview_date")} />
              </div>
              {(
                [
                  ["questions_asked", "Questions Asked"],
                  ["my_answers", "My Answers"],
                  ["better_answers", "Better Answers"],
                  ["feedback", "Feedback Received"],
                  ["mistakes", "Mistakes Made"],
                  ["lessons_learned", "Lessons Learned"],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="space-y-2 sm:col-span-2">
                  <Label>{label}</Label>
                  <Textarea {...form.register(field)} rows={2} />
                </div>
              ))}
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
