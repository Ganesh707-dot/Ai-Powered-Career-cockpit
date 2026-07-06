"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import type { DashboardResponse } from "@/types";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageLoading } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardResponse>("/dashboard")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;
  if (!data) {
    return (
      <div className="text-center text-muted-foreground">
        Failed to load dashboard. Is the backend running?
      </div>
    );
  }

  const { stats, recent_activity, upcoming_interviews } = data;
  const weeklyPercent = Math.min(
    (stats.weekly_progress / stats.weekly_goal) * 100,
    100
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={stats.total_applications}
          icon={Briefcase}
        />
        <StatCard
          title="Today's Applications"
          value={stats.today_applications}
          icon={Send}
        />
        <StatCard
          title="Interviews Scheduled"
          value={stats.interviews_scheduled}
          icon={Calendar}
        />
        <StatCard
          title="Offers"
          value={stats.offers}
          icon={CheckCircle2}
          trend={stats.offers > 0 ? "Keep going!" : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Rejections" value={stats.rejections} icon={XCircle} />
        <StatCard title="Follow Ups Due" value={stats.follow_ups_due} icon={Clock} />
        <StatCard title="In Progress" value={stats.in_progress} icon={TrendingUp} />
        <StatCard title="Applied" value={stats.applied} icon={Send} />
      </div>

      {/* Weekly Goal + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              Weekly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">{stats.weekly_progress}</span>
                <span className="text-sm text-muted-foreground">
                  / {stats.weekly_goal} applications
                </span>
              </div>
              <Progress value={weeklyPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {weeklyPercent >= 100
                  ? "Goal achieved! Great work this week."
                  : `${stats.weekly_goal - stats.weekly_progress} more to hit your goal`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Add Application", href: "/jobs?action=new", icon: Briefcase },
                { label: "Analyze JD", href: "/jd-analysis", icon: Target },
                { label: "Prep Interview", href: "/interview-prep", icon: Calendar },
                { label: "Log Interview", href: "/journal?action=new", icon: CheckCircle2 },
              ].map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon className="h-5 w-5 text-primary" />
                    <span className="text-xs">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity + Upcoming */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recent_activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No activity yet. Start by adding your first application.
              </p>
            ) : (
              <div className="space-y-4">
                {recent_activity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming_interviews.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No upcoming interviews. Move applications to interview stages.
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming_interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{interview.company}</p>
                      <p className="text-xs text-muted-foreground">{interview.role}</p>
                    </div>
                    <StatusBadge status={interview.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
