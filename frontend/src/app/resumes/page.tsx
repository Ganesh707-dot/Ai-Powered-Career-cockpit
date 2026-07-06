"use client";

import { useEffect, useState } from "react";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Resume, ResumeListResponse, ResumeType } from "@/types";
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
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading-spinner";

const RESUME_TYPES: ResumeType[] = [
  "React Resume",
  "Next.js Resume",
  "Angular Resume",
  "Full Stack Resume",
  "AI Resume",
  "Custom",
];

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resume | null>(null);
  const [form, setForm] = useState({
    name: "",
    resume_type: "Full Stack Resume" as ResumeType,
    target_role: "",
    skills_highlighted: "",
    notes: "",
    last_updated: "",
  });

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const data = await api.get<ResumeListResponse>("/resumes");
      setResumes(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      resume_type: "Full Stack Resume",
      target_role: "",
      skills_highlighted: "",
      notes: "",
      last_updated: new Date().toISOString().split("T")[0],
    });
    setDialogOpen(true);
  };

  const openEdit = (resume: Resume) => {
    setEditing(resume);
    setForm({
      name: resume.name,
      resume_type: resume.resume_type,
      target_role: resume.target_role || "",
      skills_highlighted: resume.skills_highlighted || "",
      notes: resume.notes || "",
      last_updated: resume.last_updated || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      last_updated: form.last_updated || null,
    };
    try {
      if (editing) {
        await api.patch(`/resumes/${editing.id}`, payload);
      } else {
        await api.post("/resumes", payload);
      }
      setDialogOpen(false);
      fetchResumes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this resume version?")) return;
    await api.delete(`/resumes/${id}`);
    fetchResumes();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end">
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          Add Resume
        </Button>
      </div>

      {loading ? (
        <PageLoading />
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resume versions"
          description="Manage multiple resume versions tailored for different roles."
          actionLabel="Add Resume"
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{resume.name}</p>
                    <Badge variant="outline" className="mt-2">
                      {resume.resume_type}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(resume)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(resume.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {resume.target_role && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Target: {resume.target_role}
                  </p>
                )}
                {resume.skills_highlighted && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {resume.skills_highlighted}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Updated: {formatDate(resume.last_updated)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Resume" : "Add Resume"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.resume_type}
                onValueChange={(v) =>
                  setForm({ ...form, resume_type: v as ResumeType })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RESUME_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Role</Label>
              <Input
                value={form.target_role}
                onChange={(e) => setForm({ ...form, target_role: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Skills Highlighted</Label>
              <Input
                value={form.skills_highlighted}
                onChange={(e) =>
                  setForm({ ...form, skills_highlighted: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Last Updated</Label>
              <Input
                type="date"
                value={form.last_updated}
                onChange={(e) => setForm({ ...form, last_updated: e.target.value })}
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
