"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Radar,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { buildPortalSearchUrl, PORTAL_META } from "@/lib/job-portals";
import { formatRelativeTime } from "@/lib/utils";
import { useProfileStore } from "@/stores/profile-store";
import type { DashboardResponse, DiscoveredJob } from "@/types";
import { JobMentorChat, MentorJobCard } from "@/components/cockpit/job-mentor-chat";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function CareerCockpitPage() {
  const profile = useProfileStore();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [jobs, setJobs] = useState<DiscoveredJob[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleJobsUpdate = useCallback((items: DiscoveredJob[], total: number) => {
    setJobs(items);
    setTotalJobs(total);
  }, []);

  useEffect(() => {
    api
      .get<DashboardResponse>("/dashboard")
      .then(setDashboard)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const trackJob = async (job: DiscoveredJob) => {
    try {
      await api.post("/applications", {
        company: job.company,
        role: job.role,
        job_url: job.job_url,
        source: job.source,
        salary: `${job.salary_min_lpa}-${job.salary_max_lpa} LPA`,
        experience: job.experience_years,
        location: job.location,
        work_mode: job.work_mode,
        skills_required: job.skills.join(", "),
        priority: job.match_score >= 75 ? "High" : "Medium",
        status: "Saved",
        notes: `Mentor match ${job.match_score}% — ${job.match_reasons.join("; ")}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const portalParams = {
    targetRole: profile.targetRole,
    skills: profile.skillsList(),
    location: profile.locationsList()[0] || "India",
    minSalaryLPA: profile.minSalaryLPA,
    yearsExperience: profile.yearsExperience,
    workMode: profile.workModePref,
  };

  if (loading) return <PageShell wide><PageLoading /></PageShell>;

  const stats = dashboard?.stats;
  const weeklyPercent = stats
    ? Math.min((stats.weekly_progress / stats.weekly_goal) * 100, 100)
    : 0;

  return (
    <PageShell wide>
      <PageHeader
        title={
          profile.displayName
            ? `Welcome back, ${profile.displayName.split(" ")[0]}`
            : "Career Cockpit"
        }
        description="Conversational job search — your resume, salary band, and preferences drive every match."
        icon={Radar}
        badge="Live"
        className="max-lg:[&_h1]:hidden max-lg:[&_p]:hidden"
        actions={
          <Button variant="outline" size="sm" className="rounded-lg hidden sm:inline-flex" asChild>
            <Link href="/jobs">View pipeline</Link>
          </Button>
        }
      />

      {stats && (
        <div className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tracked" value={stats.total_applications} icon={Briefcase} />
          <StatCard title="This week" value={stats.weekly_progress} icon={TrendingUp} />
          <StatCard title="Interviews" value={stats.interviews_scheduled} icon={Target} />
          <StatCard title="Matches" value={totalJobs} icon={Radar} />
        </div>
      )}

      <div className="grid gap-4 lg:gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7 2xl:col-span-8 order-1">
          <JobMentorChat onJobsUpdate={handleJobsUpdate} onTrack={trackJob} />
        </div>

        <div className="xl:col-span-5 2xl:col-span-4 space-y-4 order-2">
          <section className="surface-elevated p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              External portals
            </h2>
            <div className="grid gap-2 grid-cols-2">
              {profile.enabledPortals.map((portal) => {
                const meta = PORTAL_META[portal];
                const url = buildPortalSearchUrl(portal, portalParams);
                return (
                  <a
                    key={portal}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group flex items-center justify-between rounded-lg border p-3 text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br",
                      meta.color
                    )}
                  >
                    <span className="font-medium">{meta.label}</span>
                    <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                );
              })}
            </div>
          </section>

          {stats && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-3xl font-bold tabular-nums">{stats.weekly_progress}</span>
                  <span className="text-sm text-muted-foreground">/ {stats.weekly_goal} apps</span>
                </div>
                <Progress value={weeklyPercent} className="h-2" />
              </CardContent>
            </Card>
          )}

          {dashboard?.recent_activity && dashboard.recent_activity.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.recent_activity.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    className="flex gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(a.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Matched roles</h2>
            <p className="text-sm text-muted-foreground">
              {jobs.length} of {totalJobs} ranked by resume fit & conversation context
            </p>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg w-fit" asChild>
            <Link href="/jobs">Open pipeline</Link>
          </Button>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon={Radar}
            title="No matches yet"
            description="Tell the job mentor what you're looking for — roles appear here as the conversation narrows your search."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {jobs.map((job, i) => (
              <MentorJobCard key={job.id} job={job} index={i} onTrack={trackJob} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
