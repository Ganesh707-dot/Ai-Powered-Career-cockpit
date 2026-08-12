"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Brain,
  FileText,
  Mic,
  Radar,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { buildPortalSearchUrl, PORTAL_META } from "@/lib/job-portals";
import { formatRelativeTime } from "@/lib/utils";
import { useProfileStore } from "@/stores/profile-store";
import type { DashboardResponse, DiscoveredJob } from "@/types";
import { JobMentorChat, MentorJobCard } from "@/components/cockpit/job-mentor-chat";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { name: "Applications", href: "/jobs", icon: Briefcase, gradient: "from-sky-500/25 to-sky-600/5" },
  { name: "Interview Prep", href: "/interview-prep", icon: Mic, gradient: "from-violet-500/25 to-violet-600/5" },
  { name: "JD Analysis", href: "/jd-analysis", icon: Brain, gradient: "from-amber-500/25 to-amber-600/5" },
  { name: "Resumes", href: "/resumes", icon: FileText, gradient: "from-emerald-500/25 to-emerald-600/5" },
] as const;

interface MobileHomeProps {
  dashboard: DashboardResponse | null;
  jobs: DiscoveredJob[];
  totalJobs: number;
  onJobsUpdate: (jobs: DiscoveredJob[], total: number) => void;
  onTrack: (job: DiscoveredJob) => void;
}

export function MobileHome({
  dashboard,
  jobs,
  totalJobs,
  onJobsUpdate,
  onTrack,
}: MobileHomeProps) {
  const profile = useProfileStore();
  const stats = dashboard?.stats;
  const weeklyPercent = stats
    ? Math.min((stats.weekly_progress / stats.weekly_goal) * 100, 100)
    : 0;

  const portalParams = {
    targetRole: profile.targetRole,
    skills: profile.skillsList(),
    location: profile.locationsList()[0] || "India",
    minSalaryLPA: profile.minSalaryLPA,
    yearsExperience: profile.yearsExperience,
    workMode: profile.workModePref,
  };

  const greeting = profile.displayName
    ? `Hi, ${profile.displayName.split(" ")[0]}`
    : "Your career cockpit";

  return (
    <div className="mobile-home space-y-5 pb-6">
      {/* Mobile-only hero — no desktop sidebar feel */}
      <section className="mobile-home-hero px-4 pt-3 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-primary/80">
              CareerPilot
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {greeting}
            </h1>
            <p className="mt-1.5 text-sm text-foreground/80 leading-snug">
              Chat to search roles — resume, salary & intent from conversation.
            </p>
          </div>
          <Link
            href="/profile"
            className="mobile-avatar-btn shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-muted/50 text-muted-foreground"
            aria-label="Profile setup (optional)"
          >
            <Settings2 className="h-4 w-4" />
          </Link>
        </div>

        {stats && (
          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-thin pb-0.5 -mx-1 px-1">
            {[
              { label: "Tracked", value: stats.total_applications, icon: Briefcase },
              { label: "This week", value: stats.weekly_progress, icon: TrendingUp },
              { label: "Interviews", value: stats.interviews_scheduled, icon: Target },
              { label: "Matches", value: totalJobs, icon: Radar },
            ].map((s) => (
              <div key={s.label} className="mobile-stat-pill shrink-0">
                <s.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-lg font-bold tabular-nums">{s.value}</span>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick tools grid */}
      <section className="px-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/70">
          Quick tools
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "mobile-quick-tile bg-gradient-to-br",
                action.gradient
              )}
            >
              <span className="mobile-quick-icon">
                <action.icon className="h-5 w-5 text-primary" />
              </span>
              <span className="text-sm font-medium leading-tight">{action.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Job mentor — primary mobile surface */}
      <section className="px-4">
        <JobMentorChat compact onJobsUpdate={onJobsUpdate} onTrack={onTrack} />
      </section>

      {/* Portals horizontal scroll */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Job portals
          </h2>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1">
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
                  "mobile-portal-chip shrink-0 bg-gradient-to-br",
                  meta.color
                )}
              >
                <span className="font-medium text-sm">{meta.label}</span>
                <ArrowUpRight className="h-4 w-4 opacity-60" />
              </a>
            );
          })}
        </div>
      </section>

      {stats && (
        <section className="mx-4 rounded-2xl border border-border/60 bg-card/60 p-4">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-sm font-medium">Weekly goal</p>
            <p className="text-xs text-muted-foreground">
              {stats.weekly_progress} / {stats.weekly_goal} apps
            </p>
          </div>
          <Progress value={weeklyPercent} className="h-2" />
        </section>
      )}

      {/* Matches */}
      <section className="px-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Matched roles</h2>
            <p className="text-xs text-muted-foreground">
              {jobs.length} of {totalJobs} from your chat
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-xs font-medium text-primary shrink-0"
          >
            Pipeline →
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary/60 mb-2" />
            <p className="text-sm font-medium">No matches yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
              Tell the mentor what you want — roles show up here instantly.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1 snap-x snap-mandatory">
            {jobs.map((job, i) => (
              <div key={job.id} className="w-[min(88vw,320px)] shrink-0 snap-start">
                <MentorJobCard job={job} index={i} onTrack={onTrack} compact />
              </div>
            ))}
          </div>
        )}
      </section>

      {dashboard?.recent_activity && dashboard.recent_activity.length > 0 && (
        <section className="px-4 pb-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/70">
            Recent activity
          </h2>
          <div className="space-y-2">
            {dashboard.recent_activity.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="flex gap-3 rounded-xl border border-border/50 bg-card/40 px-3 py-2.5"
              >
                <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatRelativeTime(a.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
