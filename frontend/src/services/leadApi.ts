import { api } from "./api";
import type { ApiSuccess, PaginationMeta } from "../types/api";
import type { AnalyticsSummary, Lead, LeadActivity, LeadFilters, LeadFormValues, LeadStats, TeamWorkload } from "../types/lead";
import type { User } from "../types/auth";

type LeadQuery = Partial<LeadFilters>;

function toParams(filters: LeadQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (filters.page) params.page = filters.page;
  if (filters.status) params.status = filters.status;
  if (filters.source) params.source = filters.source;
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.sort) params.sort = filters.sort;

  return params;
}

export async function getLeads(filters: LeadQuery): Promise<ApiSuccess<Lead[], PaginationMeta>> {
  const response = await api.get<ApiSuccess<Lead[], PaginationMeta>>("/leads", {
    params: toParams(filters)
  });
  return response.data;
}

export async function getLead(id: string): Promise<Lead> {
  const response = await api.get<ApiSuccess<Lead>>(`/leads/${id}`);
  return response.data.data;
}

export async function createLead(payload: LeadFormValues): Promise<Lead> {
  const response = await api.post<ApiSuccess<Lead>>("/leads", payload);
  return response.data.data;
}

export async function updateLead(id: string, payload: LeadFormValues): Promise<Lead> {
  const response = await api.put<ApiSuccess<Lead>>(`/leads/${id}`, payload);
  return response.data.data;
}

export async function deleteLead(id: string): Promise<void> {
  await api.delete<ApiSuccess<null>>(`/leads/${id}`);
}

export async function getLeadStats(): Promise<LeadStats> {
  const response = await api.get<ApiSuccess<LeadStats>>("/leads/stats");
  return response.data.data;
}

export async function exportLeadsCsv(filters: LeadQuery): Promise<Blob> {
  const response = await api.get<Blob>("/leads/export/csv", {
    params: toParams(filters),
    responseType: "blob"
  });
  return response.data;
}

export async function getLeadActivities(id: string): Promise<LeadActivity[]> {
  const response = await api.get<ApiSuccess<LeadActivity[]>>(`/leads/${id}/activities`);
  return response.data.data;
}

export async function addLeadNote(id: string, note: string): Promise<LeadActivity> {
  const response = await api.post<ApiSuccess<LeadActivity>>(`/leads/${id}/activities`, { note });
  return response.data.data;
}

export async function getFollowUps(scope?: "overdue" | "today" | "upcoming"): Promise<Lead[]> {
  const response = await api.get<ApiSuccess<Lead[]>>("/leads/follow-ups", { params: scope ? { scope } : undefined });
  return response.data.data;
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const response = await api.get<ApiSuccess<AnalyticsSummary>>("/analytics");
  return response.data.data;
}

export async function getTeamWorkload(): Promise<TeamWorkload[]> {
  const response = await api.get<ApiSuccess<TeamWorkload[]>>("/analytics/team");
  return response.data.data;
}

export async function getSalesUsers(): Promise<User[]> {
  const response = await api.get<ApiSuccess<User[]>>("/users/sales");
  return response.data.data;
}
