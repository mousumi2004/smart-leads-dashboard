import type { User } from "./auth";

export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = ["Website", "Instagram", "Referral"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_PRIORITIES = ["Low", "Medium", "High"] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

export const FOLLOW_UP_TYPES = ["Call", "Email", "WhatsApp", "Meeting", "Demo"] as const;
export type FollowUpType = (typeof FOLLOW_UP_TYPES)[number];

export interface Lead {
  id: string;
  _id?: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  assignedTo?: Pick<User, "id" | "_id" | "name" | "email">;
  nextFollowUpAt?: string;
  followUpType?: FollowUpType;
  followUpNote?: string;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: Pick<User, "id" | "_id" | "name" | "email">;
}

export interface LeadFormValues {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  assignedTo?: string;
  nextFollowUpAt?: string;
  followUpType?: "" | FollowUpType;
  followUpNote?: string;
  statusNote?: string;
}

export interface LeadFilters {
  page: number;
  status: "" | LeadStatus;
  source: "" | LeadSource;
  search: string;
  sort: "latest" | "oldest";
}

export interface LeadStats {
  total: number;
  New: number;
  Contacted: number;
  Qualified: number;
  Lost: number;
}

export interface LeadActivity {
  _id: string;
  type: "lead_created" | "assigned" | "status_changed" | "priority_changed" | "follow_up_scheduled" | "note_added";
  message: string;
  note?: string;
  oldValue?: string;
  newValue?: string;
  actor?: Pick<User, "_id" | "name" | "email">;
  createdAt: string;
}

export interface AnalyticsDatum {
  label: string;
  value: number;
}

export interface AnalyticsSummary {
  total: number;
  byStatus: AnalyticsDatum[];
  bySource: AnalyticsDatum[];
  funnel: AnalyticsDatum[];
  followUps: {
    overdue: number;
    today: number;
    upcoming: number;
  };
}

export interface TeamWorkload {
  user: Pick<User, "_id" | "name" | "email">;
  assigned: number;
  active: number;
  qualified: number;
  lost: number;
  followUpsDue: number;
  reviewed: number;
  activityCount: number;
  lastActivityAt?: string;
}
