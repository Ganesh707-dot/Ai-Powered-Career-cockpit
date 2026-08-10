"use client";

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
import type { AnalyticsResponse } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PIE_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const tooltipStyle = {
  background: "hsl(240 10% 5.5%)",
  border: "1px solid hsl(240 5% 17%)",
  borderRadius: "8px",
};

interface AnalyticsChartsProps {
  data: AnalyticsResponse;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const trendData = data.application_trends.map((t) => ({
    date: t.date.slice(5),
    count: t.count,
  }));

  const weeklyData = data.weekly_progress.map((t) => ({
    week: t.date.slice(5),
    count: t.count,
  }));

  return (
    <div className="grid gap-4 xl:gap-6 lg:grid-cols-2">
      <Card className="max-xl:rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Application Trends (30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[280px]">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
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

      <Card className="max-xl:rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[280px]">
          {data.status_distribution.length === 0 ? (
            <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No applications yet — track jobs to see status breakdown
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.status_distribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={96}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  fontSize={11}
                >
                  {data.status_distribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="max-xl:rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[280px]">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="week" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="max-xl:rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Most Requested Skills</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[280px]">
          {data.top_skills.length === 0 ? (
            <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
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
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
