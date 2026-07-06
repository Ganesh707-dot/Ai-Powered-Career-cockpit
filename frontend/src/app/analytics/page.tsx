"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";
import type { AnalyticsResponse } from "@/types";
import { StatCard } from "@/components/shared/stat-card";
import { PageLoading } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Target, Building2 } from "lucide-react";

const PIE_COLORS = [
  "#8b5cf6", "#3b82f6", "#f59e0b", "#ef4444", "#10b981",
  "#6366f1", "#ec4899", "#14b8a6", "#f97316",
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AnalyticsResponse>("/analytics")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;
  if (!data) {
    return (
      <div className="text-center text-muted-foreground">
        Failed to load analytics.
      </div>
    );
  }

  const trendData = data.application_trends.map((t) => ({
    date: t.date.slice(5),
    count: t.count,
  }));

  const weeklyData = data.weekly_progress.map((t) => ({
    week: t.date.slice(5),
    count: t.count,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Interview Conversion"
          value={`${data.interview_conversion_rate}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Offer Rate"
          value={`${data.offer_rate}%`}
          icon={Award}
        />
        <StatCard
          title="Companies Applied"
          value={data.companies_applied.length}
          icon={Building2}
        />
        <StatCard
          title="Top Skills Tracked"
          value={data.top_skills.length}
          icon={Target}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Trends (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(240 10% 5.5%)",
                    border: "1px solid hsl(240 5% 17%)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.status_distribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ status, count }) => `${status}: ${count}`}
                  labelLine={false}
                  fontSize={11}
                >
                  {data.status_distribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(240 10% 5.5%)",
                    border: "1px solid hsl(240 5% 17%)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="week" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(240 10% 5.5%)",
                    border: "1px solid hsl(240 5% 17%)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Requested Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {data.top_skills.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Add skills to your applications to see trends
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.top_skills.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#888" fontSize={12} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    stroke="#888"
                    fontSize={11}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(240 10% 5.5%)",
                      border: "1px solid hsl(240 5% 17%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {data.companies_applied.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Companies Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.companies_applied.map((company) => (
                <span
                  key={company}
                  className="rounded-md border border-border bg-muted/50 px-3 py-1 text-sm"
                >
                  {company}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
