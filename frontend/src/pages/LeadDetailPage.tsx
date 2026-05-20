import { ArrowLeft, Edit, MessageSquarePlus, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/common/Button";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { SourceBadge } from "../components/common/SourceBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";
import { addLeadNote, deleteLead, getLead, getLeadActivities } from "../services/leadApi";
import type { Lead, LeadActivity } from "../types/lead";

export function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [note, setNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const loadLead = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const [leadData, activityData] = await Promise.all([getLead(id), getLeadActivities(id)]);
      setLead(leadData);
      setActivities(activityData);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadLead();
  }, [loadLead]);

  async function handleDelete() {
    if (!id) return;
    setIsDeleting(true);

    try {
      await deleteLead(id);
      navigate("/leads", { replace: true });
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
      setIsConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !note.trim()) return;
    setIsAddingNote(true);
    try {
      const activity = await addLeadNote(id, note.trim());
      setActivities((current) => [activity, ...current]);
      setNote("");
    } catch (noteError) {
      setError(getApiErrorMessage(noteError));
    } finally {
      setIsAddingNote(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading lead" />;
  if (error) return <ErrorState message={error} onRetry={loadLead} />;
  if (!lead) return <ErrorState message="Lead was not found." />;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-950" to="/leads">
            <ArrowLeft className="h-4 w-4" />
            Back to leads
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal text-stone-950">{lead.name}</h1>
          <p className="mt-1 text-sm text-stone-600">{lead.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-50"
            to={`/leads/${id}/edit`}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          {isAdmin ? (
            <Button icon={<Trash2 className="h-4 w-4" />} type="button" variant="danger" onClick={() => setIsConfirmOpen(true)}>
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <section className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Status</p>
          <div className="mt-2">
            <StatusBadge status={lead.status} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Source</p>
          <div className="mt-2">
            <SourceBadge source={lead.source} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Priority</p>
          <p className="mt-2 text-sm font-medium text-stone-950">{lead.priority}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Assigned to</p>
          <p className="mt-2 text-sm font-medium text-stone-950">{lead.assignedTo?.name ?? "Unassigned"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Next follow-up</p>
          <p className="mt-2 text-sm font-medium text-stone-950">
            {lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleString() : "Not scheduled"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Follow-up type</p>
          <p className="mt-2 text-sm font-medium text-stone-950">{lead.followUpType ?? "None"}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Follow-up note</p>
          <p className="mt-2 text-sm font-medium text-stone-950">{lead.followUpNote ?? "No note yet"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Created</p>
          <p className="mt-2 text-sm font-medium text-stone-950">{new Date(lead.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Updated</p>
          <p className="mt-2 text-sm font-medium text-stone-950">{new Date(lead.updatedAt).toLocaleString()}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Created by</p>
          <p className="mt-2 text-sm font-medium text-stone-950">{lead.createdBy?.name ?? "Unassigned"}</p>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-stone-950">Lead timeline</h2>
            <p className="mt-1 text-sm text-stone-500">Status changes, assignment, follow-ups, and notes.</p>
          </div>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleAddNote}>
          <input
            className="min-h-10 flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            placeholder="Add a quick note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <Button icon={<MessageSquarePlus className="h-4 w-4" />} type="submit" disabled={isAddingNote || !note.trim()}>
            {isAddingNote ? "Adding..." : "Add note"}
          </Button>
        </form>

        <div className="grid gap-3">
          {activities.length === 0 ? (
            <p className="text-sm text-stone-500">No activity yet.</p>
          ) : (
            activities.map((activity) => (
              <div key={activity._id} className="border-l-2 border-teal-700 pl-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-stone-950">{activity.message}</p>
                  <span className="text-xs text-stone-500">{new Date(activity.createdAt).toLocaleString()}</span>
                </div>
                {activity.note ? <p className="mt-1 text-sm text-stone-600">{activity.note}</p> : null}
                <p className="mt-1 text-xs text-stone-500">By {activity.actor?.name ?? "System"}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        isSubmitting={isDeleting}
        title="Delete lead"
        message={`Delete ${lead.name}? This cannot be undone.`}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
