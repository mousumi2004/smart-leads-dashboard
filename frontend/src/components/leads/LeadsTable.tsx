import { Edit, Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";
import { SourceBadge } from "../common/SourceBadge";
import { StatusBadge } from "../common/StatusBadge";
import type { Lead } from "../../types/lead";

interface LeadsTableProps {
  leads: Lead[];
  isAdmin: boolean;
  onDelete: (lead: Lead) => void;
}

function leadId(lead: Lead): string {
  return lead.id ?? lead._id ?? "";
}

export function LeadsTable({ isAdmin, leads, onDelete }: LeadsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              {["Lead", "Status", "Source", "Priority", "Follow-up", "Assigned", "Actions"].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {leads.map((lead) => (
              <tr key={leadId(lead)} className="transition hover:bg-teal-50/45">
                <td className="whitespace-nowrap px-4 py-4">
                  <p className="text-sm font-semibold text-stone-950">{lead.name}</p>
                  <p className="text-sm text-stone-500">{lead.email}</p>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-4">
                  <SourceBadge source={lead.source} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-stone-600">
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">{lead.priority}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-stone-600">
                  {lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleDateString() : "No follow-up"}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-stone-600">
                  {lead.assignedTo?.name ?? "Unassigned"}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="flex gap-2">
                    <Link
                      to={`/leads/${leadId(lead)}`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                    <Link
                      to={`/leads/${leadId(lead)}/edit`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                    {isAdmin ? (
                      <Button
                        aria-label={`Delete ${lead.name}`}
                        className="px-3"
                        icon={<Trash2 className="h-4 w-4" />}
                        type="button"
                        variant="ghost"
                        onClick={() => onDelete(lead)}
                      >
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
