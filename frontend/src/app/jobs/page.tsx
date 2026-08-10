"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  APPLICATION_STATUSES,
  JOB_SOURCES,
  PRIORITIES,
  WORK_MODES,
  type Application,
  type ApplicationListResponse,
  type ApplicationStatus,
  PRIORITY_COLORS,
} from "@/types";
import { useApplicationStore } from "@/stores/application-store";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";

const applicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  job_url: z.string().optional(),
  source: z.string(),
  salary: z.string().optional(),
  experience: z.string().optional(),
  location: z.string().optional(),
  work_mode: z.string(),
  skills_required: z.string().optional(),
  priority: z.string(),
  status: z.string(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  application_date: z.string().optional(),
  follow_up_date: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const defaultValues: ApplicationFormData = {
  company: "",
  role: "",
  job_url: "",
  source: "LinkedIn",
  salary: "",
  experience: "",
  location: "",
  work_mode: "Remote",
  skills_required: "",
  priority: "Medium",
  status: "Saved",
  notes: "",
  tags: "",
  application_date: "",
  follow_up_date: "",
};

export default function JobsPage() {
  const {
    applications,
    total,
    loading,
    search,
    statusFilter,
    viewMode,
    setApplications,
    setLoading,
    setSearch,
    setStatusFilter,
    setViewMode,
    addApplication,
    updateApplication,
    removeApplication,
  } = useApplicationStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
  });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await api.get<ApplicationListResponse>(`/applications${query}`);
      setApplications(data.items, data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter]);

  const openCreate = () => {
    setEditingApp(null);
    form.reset(defaultValues);
    setDialogOpen(true);
  };

  const openEdit = (app: Application) => {
    setEditingApp(app);
    form.reset({
      company: app.company,
      role: app.role,
      job_url: app.job_url || "",
      source: app.source,
      salary: app.salary || "",
      experience: app.experience || "",
      location: app.location || "",
      work_mode: app.work_mode,
      skills_required: app.skills_required || "",
      priority: app.priority,
      status: app.status,
      notes: app.notes || "",
      tags: app.tags || "",
      application_date: app.application_date || "",
      follow_up_date: app.follow_up_date || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ApplicationFormData) => {
    const payload = {
      ...data,
      application_date: data.application_date || null,
      follow_up_date: data.follow_up_date || null,
    };

    try {
      if (editingApp) {
        const updated = await api.patch<Application>(
          `/applications/${editingApp.id}`,
          payload
        );
        updateApplication(updated);
      } else {
        const created = await api.post<Application>("/applications", payload);
        addApplication(created);
      }
      setDialogOpen(false);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this application?")) return;
    try {
      await api.delete(`/applications/${id}`);
      removeApplication(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: number, status: ApplicationStatus) => {
    try {
      const updated = await api.patch<Application>(`/applications/${id}`, { status });
      updateApplication(updated);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies, roles, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "table" | "kanban")}
          >
            <TabsList>
              <TabsTrigger value="table">
                <List className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="kanban">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {total} application{total !== 1 ? "s" : ""}
      </p>

      {loading ? (
        <PageLoading />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No applications yet"
          description="Start tracking your job search by adding your first application."
          actionLabel="Add Application"
          onAction={openCreate}
        />
      ) : viewMode === "table" ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Company</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Source</th>
                  <th className="px-4 py-3 text-left font-medium">Applied</th>
                  <th className="px-4 py-3 text-left font-medium">Follow Up</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{app.company}</td>
                    <td className="px-4 py-3 text-muted-foreground">{app.role}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className={cn("px-4 py-3", PRIORITY_COLORS[app.priority])}>
                      {app.priority}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{app.source}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(app.application_date)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(app.follow_up_date)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(app)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(app.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <KanbanView
          applications={applications}
          onStatusChange={handleStatusChange}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {editingApp ? "Edit Application" : "New Application"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col min-h-0 overflow-hidden"
          >
            <DialogBody>
              <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input {...form.register("company")} />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Input {...form.register("role")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Job URL</Label>
                <Input {...form.register("job_url")} placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={form.watch("source")}
                  onValueChange={(v) => form.setValue("source", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) => form.setValue("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(v) => form.setValue("priority", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Mode</Label>
                <Select
                  value={form.watch("work_mode")}
                  onValueChange={(v) => form.setValue("work_mode", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_MODES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Salary</Label>
                <Input {...form.register("salary")} placeholder="e.g. 25-30 LPA" />
              </div>
              <div className="space-y-2">
                <Label>Experience</Label>
                <Input {...form.register("experience")} placeholder="e.g. 4+ years" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input {...form.register("location")} />
              </div>
              <div className="space-y-2">
                <Label>Application Date</Label>
                <Input type="date" {...form.register("application_date")} />
              </div>
              <div className="space-y-2">
                <Label>Follow Up Date</Label>
                <Input type="date" {...form.register("follow_up_date")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Skills Required</Label>
                <Input
                  {...form.register("skills_required")}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Tags</Label>
                <Input
                  {...form.register("tags")}
                  placeholder="frontend, remote, startup"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Notes</Label>
                <Textarea {...form.register("notes")} rows={3} />
              </div>
              </div>
            </DialogBody>
            <DialogFooter className="modal-footer-stacked">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingApp ? "Save Changes" : "Create Application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KanbanView({
  applications,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  applications: Application[];
  onStatusChange: (id: number, status: ApplicationStatus) => void;
  onEdit: (app: Application) => void;
  onDelete: (id: number) => void;
}) {
  const columns: ApplicationStatus[] = [
    "Saved",
    "Applied",
    "Phone Screen",
    "Technical",
    "Onsite",
    "Offer",
    "Rejected",
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {columns.map((status) => {
        const items = applications.filter((a) => a.status === status);
        return (
          <div
            key={status}
            className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-card"
          >
            <div className="flex items-center justify-between border-b border-border p-3">
              <StatusBadge status={status} />
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="flex-1 space-y-2 p-2 min-h-[200px]">
              {items.map((app) => (
                <div
                  key={app.id}
                  className="rounded-md border border-border bg-background p-3 space-y-2 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => onEdit(app)}
                >
                  <p className="text-sm font-medium">{app.company}</p>
                  <p className="text-xs text-muted-foreground">{app.role}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn("text-xs", PRIORITY_COLORS[app.priority])}
                    >
                      {app.priority}
                    </span>
                    <Select
                      value={app.status}
                      onValueChange={(v) =>
                        onStatusChange(app.id, v as ApplicationStatus)
                      }
                    >
                      <SelectTrigger
                        className="h-6 w-auto text-[10px] px-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
