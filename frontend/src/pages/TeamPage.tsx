import { Activity, Calendar, CheckCircle2, ShieldAlert, UserRoundCheck, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";
import { getTeamWorkload } from "../services/leadApi";
import type { TeamWorkload } from "../types/lead";

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString() : "No activity yet";
}

function workloadScore(row: TeamWorkload) {
  return row.active + row.followUpsDue * 1.5;
}

export function TeamPage() {
  const { isAdmin } = useAuth();
  const [team, setTeam] = useState<TeamWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setTeam(await getTeamWorkload());
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  const recommendedOwner = useMemo(() => {
    if (team.length === 0) return null;
    return [...team].sort((a, b) => workloadScore(a) - workloadScore(b) || a.assigned - b.assigned)[0];
  }, [team]);

  const totals = useMemo(
    () =>
      team.reduce(
        (result, row) => ({
          active: result.active + row.active,
          assigned: result.assigned + row.assigned,
          followUpsDue: result.followUpsDue + row.followUpsDue,
          reviewed: result.reviewed + row.reviewed
        }),
        { active: 0, assigned: 0, followUpsDue: 0, reviewed: 0 }
      ),
    [team]
  );

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) return <LoadingState label="Loading sales team" />;
  if (error) return <ErrorState message={error} onRetry={loadTeam} />;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-stone-950">Sales team</h1>
          <p className="mt-1 text-sm text-stone-600">Admin view of Sales Users, assigned workload, follow-ups due, and reviewed lead activity.</p>
        </div>
        {recommendedOwner ? (
          <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Next lead suggestion</p>
            <p className="mt-1 text-sm font-semibold text-teal-950">{recommendedOwner.user.name}</p>
          </div>
        ) : null}
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          { icon: Users, label: "Sales Users", value: team.length },
          { icon: UserRoundCheck, label: "Assigned leads", value: totals.assigned },
          { icon: Activity, label: "Reviewed leads", value: totals.reviewed },
          { icon: Calendar, label: "Follow-ups due", value: totals.followUpsDue }
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-white p-4">
            <Icon className="h-5 w-5 text-teal-700" />
            <p className="mt-4 text-3xl font-semibold text-stone-950">{value}</p>
            <p className="mt-1 text-sm text-stone-500">{label}</p>
          </div>
        ))}
      </section>

      {team.length === 0 ? (
        <section className="rounded-lg border border-stone-200 bg-white p-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-stone-400" />
          <h2 className="mt-4 text-base font-semibold text-stone-950">No Sales Users yet</h2>
          <p className="mt-2 text-sm text-stone-600">Create a Sales User account to start assigning leads and comparing workload.</p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <div className="grid gap-3 border-b border-stone-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-stone-500 md:grid-cols-[1.2fr_repeat(6,0.7fr)_1.2fr]">
            <p>Sales User</p>
            <p>Assigned</p>
            <p>Active</p>
            <p>Qualified</p>
            <p>Lost</p>
            <p>Due</p>
            <p>Reviewed</p>
            <p>Last activity</p>
          </div>
          <div className="divide-y divide-stone-100">
            {team.map((row) => (
              <div key={row.user._id} className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1.2fr_repeat(6,0.7fr)_1.2fr] md:items-center">
                <div>
                  <p className="font-semibold text-stone-950">{row.user.name}</p>
                  <p className="mt-1 text-stone-500">{row.user.email}</p>
                </div>
                <p className="font-semibold text-stone-950">{row.assigned}</p>
                <p className="text-stone-700">{row.active}</p>
                <p className="text-emerald-700">{row.qualified}</p>
                <p className="text-red-700">{row.lost}</p>
                <p className="text-amber-700">{row.followUpsDue}</p>
                <div>
                  <p className="font-semibold text-stone-950">{row.reviewed}</p>
                  <p className="text-xs text-stone-500">{row.activityCount} actions</p>
                </div>
                <p className="text-stone-600">{formatDate(row.lastActivityAt)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-teal-700" />
          <div>
            <h2 className="text-base font-semibold text-stone-950">How reviewed leads are counted</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              A lead is counted as reviewed when a Sales User updates status, changes priority, schedules a follow-up, or adds a note in the timeline.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
