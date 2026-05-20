import type { FilterQuery } from "mongoose";
import type { LeadDocument } from "../models/Lead.js";

export type LeadFilter = FilterQuery<LeadDocument>;

export interface LeadListQuery {
  status?: string;
  source?: string;
  search?: string;
  sort: "latest" | "oldest";
  page: number;
  limit: number;
}

export interface FollowUpQuery {
  scope?: "overdue" | "today" | "upcoming";
}
