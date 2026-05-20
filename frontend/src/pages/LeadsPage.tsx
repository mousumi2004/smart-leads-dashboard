import { Download, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { LeadFilters } from "../components/leads/LeadFilters";
import { LeadsTable } from "../components/leads/LeadsTable";
import { Pagination } from "../components/leads/Pagination";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import { useLeads } from "../hooks/useLeads";
import { getApiErrorMessage } from "../services/api";
import { deleteLead, exportLeadsCsv } from "../services/leadApi";
import type { Lead, LeadFilters as LeadFiltersType } from "../types/lead";
import { downloadBlob } from "../utils/download";

const initialFilters: LeadFiltersType = {
  page: 1,
  search: "",
  sort: "latest",
  source: "",
  status: ""
};

export function LeadsPage() {
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState<LeadFiltersType>(initialFilters);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const queryFilters = useMemo(() => ({ ...filters, search: debouncedSearch }), [debouncedSearch, filters]);
  const { error, isLoading, leads, meta, refetch } = useLeads(queryFilters);

  function updateFilters(nextFilters: Partial<LeadFiltersType>) {
    setFilters((current) => ({ ...current, ...nextFilters, page: 1 }));
  }

  function clearFilters() {
    setSearchInput("");
    setFilters(initialFilters);
  }

  async function confirmDelete() {
    if (!leadToDelete) return;
    setIsDeleting(true);
    setActionError(null);

    try {
      await deleteLead(leadToDelete.id ?? leadToDelete._id ?? "");
      setLeadToDelete(null);
      await refetch();
    } catch (deleteError) {
      setActionError(getApiErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    setActionError(null);

    try {
      const blob = await exportLeadsCsv(queryFilters);
      downloadBlob(blob, "smart-leads-export.csv");
    } catch (exportError) {
      setActionError(getApiErrorMessage(exportError));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-stone-950">Leads workspace</h1>
          <p className="mt-1 text-sm text-stone-600">
            {isAdmin
              ? "Admin view across all customer leads, assignments, and exports."
              : "Your assigned customer leads, follow-ups, and status updates."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAdmin ? (
            <Button
              icon={<Download className="h-4 w-4" />}
              type="button"
              variant="secondary"
              disabled={isExporting}
              onClick={handleExport}
            >
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          ) : null}
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            to="/leads/new"
          >
            <Plus className="h-4 w-4" />
            New lead
          </Link>
        </div>
      </div>

      <LeadFilters
        filters={filters}
        searchValue={searchInput}
        onClear={clearFilters}
        onFiltersChange={updateFilters}
        onSearchChange={(value) => {
          setSearchInput(value);
          setFilters((current) => ({ ...current, page: 1 }));
        }}
      />

      {actionError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {actionError}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState label="Loading leads" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : leads.length === 0 ? (
        <EmptyState
          title="No leads match this view"
          message="Adjust filters or create a new lead to add activity to this workspace."
          action={
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              to="/leads/new"
            >
              Create lead
            </Link>
          }
        />
      ) : (
        <div>
          <LeadsTable leads={leads} isAdmin={isAdmin} onDelete={setLeadToDelete} />
          <Pagination
            meta={meta}
            onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(leadToDelete)}
        isSubmitting={isDeleting}
        title="Delete lead"
        message={`Delete ${leadToDelete?.name ?? "this lead"}? This cannot be undone.`}
        onCancel={() => setLeadToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
