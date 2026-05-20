import type { LeadSource } from "../../types/lead";

const styles: Record<LeadSource, string> = {
  Website: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Instagram: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  Referral: "bg-indigo-50 text-indigo-700 ring-indigo-200"
};

export function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[source]}`}>
      {source}
    </span>
  );
}
