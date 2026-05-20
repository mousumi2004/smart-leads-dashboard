import { BarChart3, Calendar, CircleGauge, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";
import { getAnalytics, getTeamWorkload } from "../services/leadApi";
import type { AnalyticsDatum, AnalyticsSummary, TeamWorkload } from "../types/lead";

function ChartRows({ data }: { data: AnalyticsDatum[] }) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="grid gap-3">
      {data.map((item) => (
        <div key={item.label} className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-stone-700">{item.label}</span>
            <span className="text-sm font-semibold text-stone-950">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-stone-100">
            <div className="h-full rounded-full bg-teal-700" style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value
}: {
  icon: typeof BarChart3;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <Icon className="h-5 w-5 text-teal-700" />
      <p className="mt-4 text-3xl font-semibold text-stone-950">{value}</p>
      <p className="mt-1 text-sm text-stone-500">{label}</p>
    </div>
  );
}

export function AnalyticsPage() {
  const { isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [team, setTeam] = useState<TeamWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [analyticsData, teamData] = await Promise.all([getAnalytics(), isAdmin ? getTeamWorkload() : Promise.resolve([])]);
      setAnalytics(analyticsData);
      setTeam(teamData);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const topPerformer = useMemo(() => {
    if (team.length === 0) return null;
    return [...team].sort((a, b) => b.reviewed - a.reviewed || b.qualified - a.qualified)[0];
  }, [team]);

  if (isLoading) return <LoadingState label="Loading analytics" />;
  if (error) return <ErrorState message={error} onRetry={loadAnalytics} />;
  if (!analytics) return <ErrorState message="Analytics data is not available." />;

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-stone-950">Analytics</h1>
        <p className="mt-1 text-sm text-stone-600">
          {isAdmin ? "Admin view across the full sales pipeline." : "Your assigned lead performance and follow-up load."}
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <SummaryTile icon={BarChart3} label="Total leads" value={analytics.total} />
        <SummaryTile icon={Calendar} label="Overdue follow-ups" value={analytics.followUps.overdue} />
        <SummaryTile icon={CircleGauge} label="Due today" value={analytics.followUps.today} />
        <SummaryTile icon={Users} label="Sales users" value={isAdmin ? team.length : "Scoped"} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-stone-950">Leads by status</h2>
            <p className="mt-1 text-sm text-stone-500">Where the pipeline currently sits.</p>
          </div>
          <ChartRows data={analytics.funnel} />
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-stone-950">Leads by source</h2>
            <p className="mt-1 text-sm text-stone-500">Which intake channels are creating records.</p>
          </div>
          <ChartRows data={analytics.bySource} />
        </div>
      </section>

      {isAdmin ? (
        <section className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-base font-semibold text-stone-950">Team workload signal</h2>
              <p className="mt-1 text-sm text-stone-500">Assigned work, review activity, and conversion signal by Sales User.</p>
            </div>
            {topPerformer ? (
              <p className="rounded-md bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">
                Most reviewed: {topPerformer.user.name}
              </p>
            ) : null}
          </div>
          {team.length === 0 ? (
            <p className="text-sm text-stone-500">No Sales Users have registered yet.</p>
          ) : (
            <div className="grid gap-4">
              {team.map((row) => {
                const maxAssigned = Math.max(1, ...team.map((item) => item.assigned));
                return (
                  <div key={row.user._id} className="grid gap-3 border-b border-stone-100 pb-4 last:border-0 last:pb-0 md:grid-cols-[1fr_2fr] md:items-center">
                    <div>
                      <p className="text-sm font-semibold text-stone-950">{row.user.name}</p>
                      <p className="mt-1 text-sm text-stone-500">{row.user.email}</p>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-600">Assigned {row.assigned}</span>
                        <span className="font-semibold text-stone-950">Reviewed {row.reviewed}</span>
                      </div>
                      <div className="h-2 rounded-full bg-stone-100">
                        <div className="h-full rounded-full bg-stone-950" style={{ width: `${Math.max(8, (row.assigned / maxAssigned) * 100)}%` }} />
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-stone-600">
                        <span className="rounded-md bg-stone-100 px-2 py-1">Active {row.active}</span>
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">Qualified {row.qualified}</span>
                        <span className="rounded-md bg-red-50 px-2 py-1 text-red-700">Lost {row.lost}</span>
                        <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">Due {row.followUpsDue}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
