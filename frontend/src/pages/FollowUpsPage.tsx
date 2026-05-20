import { Calendar, Clock, Mail, Phone, Plus, Video } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { StatusBadge } from "../components/common/StatusBadge";
import { getApiErrorMessage } from "../services/api";
import { getFollowUps } from "../services/leadApi";
import type { FollowUpType, Lead } from "../types/lead";

type FollowUpScope = "all" | "overdue" | "today" | "upcoming";

const tabs: Array<{ label: string; value: FollowUpScope }> = [
  { label: "All", value: "all" },
  { label: "Overdue", value: "overdue" },
  { label: "Today", value: "today" },
  { label: "Upcoming", value: "upcoming" }
];

const followUpIcons: Record<FollowUpType, typeof Phone> = {
  Call: Phone,
  Demo: Video,
  Email: Mail,
  Meeting: Calendar,
  WhatsApp: Phone
};

function getLeadId(lead: Lead) {
  return lead.id ?? lead._id ?? "";
}

function getDueBucket(lead: Lead) {
  if (!lead.nextFollowUpAt) return "No date";
  const due = new Date(lead.nextFollowUpAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (due < today) return "Overdue";
  if (due < tomorrow) return "Today";
  return "Upcoming";
}

function getPriorityClass(priority: Lead["priority"]) {
  if (priority === "High") return "bg-red-50 text-red-700 ring-red-200";
  if (priority === "Medium") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-stone-100 text-stone-700 ring-stone-200";
}

export function FollowUpsPage() {
  const [scope, setScope] = useState<FollowUpScope>("all");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFollowUps = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getFollowUps();
      setLeads(data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFollowUps();
  }, [loadFollowUps]);

  const counts = useMemo(
    () =>
      leads.reduce(
        (result, lead) => {
          const bucket = getDueBucket(lead);
          if (bucket === "Overdue") result.overdue += 1;
          if (bucket === "Today") result.today += 1;
          if (bucket === "Upcoming") result.upcoming += 1;
          return result;
        },
        { overdue: 0, today: 0, upcoming: 0 }
      ),
    [leads]
  );

  const visibleLeads = useMemo(() => {
    if (scope === "all") return leads;
    return leads.filter((lead) => getDueBucket(lead).toLowerCase() === scope);
  }, [leads, scope]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-stone-950">Follow-up queue</h1>
          <p className="mt-1 text-sm text-stone-600">Work due leads first, with priority and next action visible before opening a record.</p>
        </div>
        <Link
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          to="/leads/new"
        >
          <Plus className="h-4 w-4" />
          New lead
        </Link>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Overdue", value: counts.overdue, color: "text-red-700" },
          { label: "Due today", value: counts.today, color: "text-amber-700" },
          { label: "Upcoming", value: counts.upcoming, color: "text-teal-700" }
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{item.label}</p>
            <p className={`mt-3 text-3xl font-semibold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-2 rounded-lg border border-stone-200 bg-white p-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`min-h-9 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              scope === tab.value ? "bg-stone-950 text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
            }`}
            type="button"
            onClick={() => setScope(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState label="Loading follow-ups" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadFollowUps} />
      ) : visibleLeads.length === 0 ? (
        <EmptyState
          title="No follow-ups in this view"
          message="Add a follow-up date on a lead to place it in this queue."
          action={
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              to="/leads"
            >
              View leads
            </Link>
          }
        />
      ) : (
        <section className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <div className="grid gap-3 border-b border-stone-200 px-5 py-4 md:grid-cols-[1.25fr_0.8fr_0.8fr_0.7fr]">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Lead</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Next action</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Due</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Priority</p>
          </div>
          <div className="divide-y divide-stone-100">
            {visibleLeads.map((lead) => {
              const Icon = lead.followUpType ? followUpIcons[lead.followUpType] : Clock;
              return (
                <Link
                  key={getLeadId(lead)}
                  className="grid gap-3 px-5 py-4 transition hover:bg-teal-50/45 md:grid-cols-[1.25fr_0.8fr_0.8fr_0.7fr] md:items-center"
                  to={`/leads/${getLeadId(lead)}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-stone-950">{lead.name}</p>
                    <p className="mt-1 text-sm text-stone-500">{lead.email}</p>
                    <div className="mt-2">
                      <StatusBadge status={lead.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-700">
                    <Icon className="h-4 w-4 text-teal-700" />
                    <span>{lead.followUpType ?? "Follow-up"}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-950">
                      {lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleString() : "Not scheduled"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-stone-500">{getDueBucket(lead)}</p>
                  </div>
                  <span className={`w-fit rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${getPriorityClass(lead.priority)}`}>
                    {lead.priority}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
