"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { AnalyticsResponse } from "@/types";
import { StatCard } from "@/components/shared/stat-card";
import { PageLoading } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Award, Target, Building2 } from "lucide-react";

const AnalyticsCharts = dynamic(
  () =>
    import("@/components/analytics/analytics-charts").then((m) => m.AnalyticsCharts),
  {
    ssr: false,
    loading: () => <PageLoading />,
  }
);

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<AnalyticsResponse>("/analytics");
      setData(response);
    } catch (err) {
      setData(null);
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load analytics. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) return <PageLoading />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center animate-fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BarChart3 className="h-7 w-7" />
        </div>
        <div className="space-y-1 max-w-sm">
          <p className="text-base font-semibold">Analytics unavailable</p>
          <p className="text-sm text-muted-foreground">{error || "Failed to load analytics."}</p>
        </div>
        <Button onClick={loadAnalytics} className="rounded-xl">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 xl:space-y-6 animate-fade-in pb-4">
      <div className="hidden xl:block">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Analytics
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Application trends, conversion rates, and skill frequency
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      <AnalyticsCharts data={data} />

      {data.companies_applied.length > 0 && (
        <Card className="max-xl:rounded-2xl">
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
