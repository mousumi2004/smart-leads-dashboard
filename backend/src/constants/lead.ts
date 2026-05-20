export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = ["Website", "Instagram", "Referral"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_PRIORITIES = ["Low", "Medium", "High"] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

export const FOLLOW_UP_TYPES = ["Call", "Email", "WhatsApp", "Meeting", "Demo"] as const;
export type FollowUpType = (typeof FOLLOW_UP_TYPES)[number];

export const ACTIVE_LEAD_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified"];
