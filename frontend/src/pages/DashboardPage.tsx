import { ArrowRight, Calendar, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { SourceBadge } from "../components/common/SourceBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatsGrid } from "../components/leads/StatsGrid";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";
import { getLeads, getLeadStats } from "../services/leadApi";
import type { Lead, LeadStats } from "../types/lead";

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setIsLoading(true);
    setError(null);

    try {
      const [statsResponse, leadsResponse] = await Promise.all([
        getLeadStats(),
        getLeads({ page: 1, sort: "latest" })
      ]);
      setStats(statsResponse);
      setRecentLeads(leadsResponse.data.slice(0, 5));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (isLoading) return <LoadingState label="Loading dashboard" />;
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-stone-950">Dashboard</h1>
          <p className="mt-1 text-sm text-stone-600">
            {isAdmin ? "Full pipeline totals, newest lead activity, and team routing entry points." : "Your assigned pipeline totals and newest lead activity."}
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          to="/leads/new"
        >
          <Plus className="h-4 w-4" />
          New lead
        </Link>
      </div>

      {stats ? <StatsGrid stats={stats} /> : null}

      <section className="grid gap-3 md:grid-cols-3">
        <Link className="rounded-lg border border-stone-200 bg-white p-4 transition hover:border-teal-200 hover:bg-teal-50/45" to="/follow-ups">
          <Calendar className="h-5 w-5 text-teal-700" />
          <h2 className="mt-3 text-sm font-semibold text-stone-950">Follow-up queue</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">Review overdue, due-today, and upcoming lead actions.</p>
        </Link>
        <Link className="rounded-lg border border-stone-200 bg-white p-4 transition hover:border-teal-200 hover:bg-teal-50/45" to="/analytics">
          <ArrowRight className="h-5 w-5 text-teal-700" />
          <h2 className="mt-3 text-sm font-semibold text-stone-950">Analytics</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">See source, status, funnel, and follow-up summaries.</p>
        </Link>
        {isAdmin ? (
          <Link className="rounded-lg border border-stone-200 bg-white p-4 transition hover:border-teal-200 hover:bg-teal-50/45" to="/team">
            <ArrowRight className="h-5 w-5 text-teal-700" />
            <h2 className="mt-3 text-sm font-semibold text-stone-950">Team workload</h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">Compare Sales Users before assigning the next lead.</p>
          </Link>
        ) : null}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-stone-950">Recent leads</h2>
            <p className="mt-1 text-sm text-stone-500">{isAdmin ? "Latest records from all leads." : "Latest records assigned to you."}</p>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800" to="/leads">
            Manage
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No leads yet"
              message="Create the first lead to populate dashboard activity and metrics."
              action={
                <Link
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  to="/leads/new"
                >
                  Create lead
                </Link>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentLeads.map((lead) => (
              <Link
                key={lead.id ?? lead._id}
                className="grid gap-3 px-5 py-4 transition hover:bg-teal-50/45 md:grid-cols-[1.4fr_auto_auto]"
                to={`/leads/${lead.id ?? lead._id}`}
              >
                <div>
                  <p className="text-sm font-semibold text-stone-950">{lead.name}</p>
                  <p className="text-sm text-stone-500">{lead.email}</p>
                </div>
                <StatusBadge status={lead.status} />
                <SourceBadge source={lead.source} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
