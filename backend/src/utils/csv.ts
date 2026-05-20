import type { LeadDocument } from "../models/Lead.js";

const escapeCsv = (value: unknown) => {
  const raw = value instanceof Date ? value.toISOString() : String(value ?? "");
  if (/[",\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
};

export const leadsToCsv = (leads: LeadDocument[]) => {
  const rows = leads.map((lead) => [lead.name, lead.email, lead.status, lead.source, lead.createdAt].map(escapeCsv).join(","));
  return ["Name,Email,Status,Source,Created At", ...rows].join("\n");
};
