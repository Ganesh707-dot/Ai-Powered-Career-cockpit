"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Pencil, Plus, Trash2, Upload, Sparkles } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useProfileStore } from "@/stores/profile-store";
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

const RESUME_TYPES: ResumeType[] = [
  "React Resume",
  "Next.js Resume",
  "Angular Resume",
  "Full Stack Resume",
  "AI Resume",
  "Custom",
];

export default function ResumesPage() {
  const profile = useProfileStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coachResult, setCoachResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
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
    if (profile.resumeId === id) {
      profile.setResume(null, "", "");
    }
    fetchResumes();
  };

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", file.name.replace(/\.[^.]+$/, ""));
      fd.append("resume_type", "Full Stack Resume");
      const uploaded = await api.upload<Resume>("/resumes/upload", fd);
      let excerpt = "";
      try {
        const textRes = await api.get<{ extracted_text: string }>(`/resumes/${uploaded.id}/text`);
        excerpt = textRes.extracted_text.slice(0, 5000);
      } catch {
        /* text stored in DB on upload */
      }
      profile.setResume(uploaded.id, uploaded.name, excerpt);
      await fetchResumes();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Upload failed";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const coachFromResume = async (resume: Resume) => {
    setError(null);
    setCoachResult(null);
    try {
      const textRes = await api.get<{ extracted_text: string }>(`/resumes/${resume.id}/text`);
      const coach = await api.post<{
        summary: string;
        strengths: string[];
        gaps: string[];
        bullet_rewrites: string[];
      }>("/resume-coach", {
        resume_text: textRes.extracted_text,
        target_role: resume.target_role || "Software Engineer",
        years_experience: 3,
      });
      setCoachResult(
        [
          coach.summary,
          "",
          "Strengths:",
          ...(coach.strengths || []).map((s) => `• ${s}`),
          "",
          "Gaps:",
          ...(coach.gaps || []).map((s) => `• ${s}`),
          "",
          "Bullet rewrites:",
          ...(coach.bullet_rewrites || []).map((s) => `• ${s}`),
        ].join("\n")
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "AI coaching failed");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <div className="flex flex-wrap justify-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md,.docx"
          className="hidden"
          onChange={(e) => {
            handleUpload(e.target.files?.[0] || null);
            e.target.value = "";
          }}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          type="button"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload (max 4MB)"}
        </Button>
        {error && (
          <p className="w-full text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
            {error}
          </p>
        )}
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          Add manually
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {coachResult && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Gemini resume coach
            </p>
            <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{coachResult}</pre>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <PageLoading />
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resume versions"
          description="Upload a PDF/DOCX/TXT resume or add metadata manually."
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
                    {resume.has_file && (
                      <Badge className="mt-2 ml-2" variant="secondary">
                        {resume.original_filename || "File"}
                      </Badge>
                    )}
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
                {resume.extracted_text_preview && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-3">
                    {resume.extracted_text_preview}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Updated: {formatDate(resume.last_updated)}
                  </p>
                  {resume.has_extracted_text && (
                    <Button size="sm" variant="outline" onClick={() => coachFromResume(resume)}>
                      <Sparkles className="h-3 w-3" />
                      AI coach
                    </Button>
                  )}
                </div>
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
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col min-h-0 overflow-hidden"
          >
            <DialogBody className="space-y-4">
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
