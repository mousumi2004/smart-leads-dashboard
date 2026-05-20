import type { LeadStatus } from "../../types/lead";

const styles: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700 ring-blue-200",
  Contacted: "bg-amber-50 text-amber-700 ring-amber-200",
  Qualified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Lost: "bg-stone-100 text-stone-700 ring-stone-200"
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[status]}`}>
      {status}
    </span>
  );
}
