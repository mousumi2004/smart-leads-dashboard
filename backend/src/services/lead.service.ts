import { Types } from "mongoose";
import { ACTIVE_LEAD_STATUSES, LEAD_STATUSES, type FollowUpType, type LeadPriority, type LeadSource, type LeadStatus } from "../constants/lead.js";
import type { AuthUser } from "../types/auth.js";
import { Lead, type LeadDocument } from "../models/Lead.js";
import { LeadActivity, type LeadActivityType } from "../models/LeadActivity.js";
import { User } from "../models/User.js";
import type { LeadFilter, LeadListQuery } from "../types/lead.js";
import type { PaginationMeta } from "../types/api.js";
import { AppError } from "../utils/apiResponse.js";

interface LeadInput {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  assignedTo?: string;
  priority?: LeadPriority;
  nextFollowUpAt?: string;
  followUpType?: FollowUpType | "";
  followUpNote?: string;
  statusNote?: string;
}

const userSummary = "name email role";
const leadPopulate = [
  { path: "createdBy", select: userSummary },
  { path: "assignedTo", select: userSummary }
];

const toObjectId = (value: string) => new Types.ObjectId(value);

const normalizeOptionalString = (value?: string) => {
  if (!value || value.trim() === "") return undefined;
  return value.trim();
};

const normalizeDate = (value?: string) => {
  const normalized = normalizeOptionalString(value);
  return normalized ? new Date(normalized) : undefined;
};

export const buildLeadFilter = (
  query: Partial<Pick<LeadListQuery, "status" | "source" | "search">>,
  actor?: AuthUser
): LeadFilter => {
  const filter: LeadFilter = {};
  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;
  if (query.search) {
    const pattern = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: pattern }, { email: pattern }];
  }
  if (actor?.role === "sales") {
    filter.assignedTo = actor._id;
  }
  return filter;
};

const ensureSalesUser = async (userId: string) => {
  const user = await User.findOne({ _id: userId, role: "sales" });
  if (!user) throw new AppError("Assigned user must be a Sales User", 400);
  return user;
};

const findLowestWorkloadSalesUser = async () => {
  const salesUsers = await User.find({ role: "sales" }).sort({ createdAt: 1 });
  if (salesUsers.length === 0) return undefined;

  const workloads = await Lead.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { assignedTo: { $exists: true }, status: { $in: ACTIVE_LEAD_STATUSES } } },
    { $group: { _id: "$assignedTo", count: { $sum: 1 } } }
  ]);
  const counts = new Map(workloads.map((row) => [row._id.toString(), row.count]));

  return salesUsers
    .map((user) => ({ user, count: counts.get(user._id.toString()) ?? 0 }))
    .sort((a, b) => a.count - b.count || a.user._id.toString().localeCompare(b.user._id.toString()))[0]?.user;
};

const resolveAssignment = async (input: LeadInput, actor: AuthUser) => {
  if (actor.role === "sales") return actor._id;
  const assignedTo = normalizeOptionalString(input.assignedTo);
  if (assignedTo) {
    const user = await ensureSalesUser(assignedTo);
    return user._id;
  }
  return (await findLowestWorkloadSalesUser())?._id;
};

const getReferenceId = (value: unknown) => {
  if (!value) return undefined;
  if (value instanceof Types.ObjectId) return value.toString();
  if (typeof value === "object" && "_id" in value) return String((value as { _id: unknown })._id);
  return String(value);
};

const canAccessLead = (lead: LeadDocument, actor: AuthUser) => {
  if (actor.role === "admin") return true;
  return getReferenceId(lead.assignedTo) === actor._id.toString();
};

const createActivity = async (input: {
  lead: Types.ObjectId;
  actor: Types.ObjectId;
  type: LeadActivityType;
  message: string;
  note?: string;
  oldValue?: string;
  newValue?: string;
}) => {
  return LeadActivity.create(input);
};

const reviewActivityTypes: LeadActivityType[] = ["status_changed", "priority_changed", "follow_up_scheduled", "note_added"];

export const createLead = async (input: LeadInput, actor: AuthUser) => {
  const assignedTo = await resolveAssignment(input, actor);
  const lead = await Lead.create({
    name: input.name,
    email: input.email,
    status: input.status,
    source: input.source,
    createdBy: actor._id,
    assignedTo,
    priority: input.priority ?? "Medium",
    nextFollowUpAt: normalizeDate(input.nextFollowUpAt),
    followUpType: normalizeOptionalString(input.followUpType),
    followUpNote: normalizeOptionalString(input.followUpNote),
    lastContactedAt: input.status === "Contacted" ? new Date() : undefined
  });

  await createActivity({
    lead: lead._id,
    actor: actor._id,
    type: "lead_created",
    message: `Lead created with status ${lead.status}`,
    newValue: lead.status
  });

  if (assignedTo) {
    await createActivity({
      lead: lead._id,
      actor: actor._id,
      type: "assigned",
      message: "Lead assigned",
      newValue: assignedTo.toString()
    });
  }

  if (lead.nextFollowUpAt) {
    await createActivity({
      lead: lead._id,
      actor: actor._id,
      type: "follow_up_scheduled",
      message: `Follow-up scheduled for ${lead.nextFollowUpAt.toISOString()}`,
      note: lead.followUpNote,
      newValue: lead.nextFollowUpAt.toISOString()
    });
  }

  return lead.populate(leadPopulate);
};

export const listLeads = async (query: LeadListQuery, actor: AuthUser) => {
  const filter = buildLeadFilter(query, actor);
  const sortDirection = query.sort === "oldest" ? 1 : -1;
  const skip = (query.page - 1) * query.limit;
  const [data, total] = await Promise.all([
    Lead.find(filter).populate(leadPopulate).sort({ createdAt: sortDirection, _id: sortDirection }).skip(skip).limit(query.limit),
    Lead.countDocuments(filter)
  ]);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const meta: PaginationMeta = {
    page: query.page,
    limit: query.limit,
    totalRecords: total,
    totalPages,
    hasNextPage: query.page < totalPages,
    hasPreviousPage: query.page > 1
  };

  return { data, meta };
};

export const getLeadById = async (id: string, actor: AuthUser) => {
  const lead = await Lead.findById(id).populate(leadPopulate);
  if (!lead) throw new AppError("Lead not found", 404);
  if (!canAccessLead(lead, actor)) throw new AppError("Forbidden", 403);
  return lead;
};

export const updateLead = async (id: string, input: Partial<LeadInput>, actor: AuthUser) => {
  const existing = await Lead.findById(id);
  if (!existing) throw new AppError("Lead not found", 404);
  if (!canAccessLead(existing, actor)) throw new AppError("Forbidden", 403);

  const previousStatus = existing.status;
  const previousPriority = existing.priority;
  const previousAssignedTo = existing.assignedTo?.toString();
  const previousFollowUpAt = existing.nextFollowUpAt?.toISOString();

  if (input.name !== undefined) existing.name = input.name;
  if (input.email !== undefined) existing.email = input.email;
  if (input.status !== undefined) {
    existing.status = input.status;
    if (input.status === "Contacted") existing.lastContactedAt = new Date();
  }
  if (input.source !== undefined) existing.source = input.source;
  if (input.priority !== undefined) existing.priority = input.priority;
  if (input.nextFollowUpAt !== undefined) existing.nextFollowUpAt = normalizeDate(input.nextFollowUpAt);
  if (input.followUpType !== undefined) existing.followUpType = normalizeOptionalString(input.followUpType) as FollowUpType | undefined;
  if (input.followUpNote !== undefined) existing.followUpNote = normalizeOptionalString(input.followUpNote);

  if (actor.role === "admin" && input.assignedTo !== undefined) {
    const assignedTo = normalizeOptionalString(input.assignedTo);
    existing.assignedTo = assignedTo ? (await ensureSalesUser(assignedTo))._id : undefined;
  }

  await existing.save();

  if (input.status !== undefined && input.status !== previousStatus) {
    await createActivity({
      lead: existing._id,
      actor: actor._id,
      type: "status_changed",
      message: `Status changed from ${previousStatus} to ${input.status}`,
      note: normalizeOptionalString(input.statusNote),
      oldValue: previousStatus,
      newValue: input.status
    });
  }

  if (input.priority !== undefined && input.priority !== previousPriority) {
    await createActivity({
      lead: existing._id,
      actor: actor._id,
      type: "priority_changed",
      message: `Priority changed from ${previousPriority} to ${input.priority}`,
      oldValue: previousPriority,
      newValue: input.priority
    });
  }

  const nextAssignedTo = existing.assignedTo?.toString();
  if (nextAssignedTo !== previousAssignedTo) {
    await createActivity({
      lead: existing._id,
      actor: actor._id,
      type: "assigned",
      message: nextAssignedTo ? "Lead reassigned" : "Lead unassigned",
      oldValue: previousAssignedTo,
      newValue: nextAssignedTo
    });
  }

  const nextFollowUpAt = existing.nextFollowUpAt?.toISOString();
  if (nextFollowUpAt !== previousFollowUpAt || input.followUpNote !== undefined || input.followUpType !== undefined) {
    await createActivity({
      lead: existing._id,
      actor: actor._id,
      type: "follow_up_scheduled",
      message: nextFollowUpAt ? `Follow-up scheduled for ${nextFollowUpAt}` : "Follow-up cleared",
      note: normalizeOptionalString(input.followUpNote),
      oldValue: previousFollowUpAt,
      newValue: nextFollowUpAt
    });
  }

  return existing.populate(leadPopulate);
};

export const deleteLead = async (id: string) => {
  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) throw new AppError("Lead not found", 404);
  await LeadActivity.deleteMany({ lead: lead._id });
  return lead;
};

export const getLeadStats = async (actor: AuthUser) => {
  const match = actor.role === "sales" ? { assignedTo: actor._id } : {};
  const rows = await Lead.aggregate<{ _id: string; count: number }>([{ $match: match }, { $group: { _id: "$status", count: { $sum: 1 } } }]);
  const stats = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0])) as Record<(typeof LEAD_STATUSES)[number], number>;
  for (const row of rows) {
    if (row._id in stats) stats[row._id as keyof typeof stats] = row.count;
  }
  return { total: Object.values(stats).reduce((sum, value) => sum + value, 0), ...stats };
};

export const getLeadsForExport = async (query: Partial<Pick<LeadListQuery, "status" | "source" | "search">>, actor: AuthUser) => {
  return Lead.find(buildLeadFilter(query, actor)).populate(leadPopulate).sort({ createdAt: -1, _id: -1 });
};

export const getActivities = async (leadId: string, actor: AuthUser) => {
  await getLeadById(leadId, actor);
  return LeadActivity.find({ lead: leadId }).populate("actor", userSummary).sort({ createdAt: -1, _id: -1 });
};

export const addNote = async (leadId: string, note: string, actor: AuthUser) => {
  const lead = await getLeadById(leadId, actor);
  return createActivity({
    lead: lead._id,
    actor: actor._id,
    type: "note_added",
    message: "Note added",
    note
  });
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfTomorrow = () => {
  const date = startOfToday();
  date.setDate(date.getDate() + 1);
  return date;
};

export const getFollowUps = async (actor: AuthUser, scope?: "overdue" | "today" | "upcoming") => {
  const today = startOfToday();
  const tomorrow = startOfTomorrow();
  const filter: LeadFilter = {
    nextFollowUpAt: { $exists: true },
    ...(actor.role === "sales" ? { assignedTo: actor._id } : {})
  };

  if (scope === "overdue") filter.nextFollowUpAt = { $lt: today };
  if (scope === "today") filter.nextFollowUpAt = { $gte: today, $lt: tomorrow };
  if (scope === "upcoming") filter.nextFollowUpAt = { $gte: tomorrow };

  const priorityRank: Record<LeadPriority, number> = { High: 0, Medium: 1, Low: 2 };
  const statusRank: Record<LeadStatus, number> = { Qualified: 0, New: 1, Contacted: 2, Lost: 3 };
  const leads = await Lead.find(filter).populate(leadPopulate).sort({ nextFollowUpAt: 1, _id: 1 });
  return leads.sort((a, b) => {
    const dateDiff = (a.nextFollowUpAt?.getTime() ?? 0) - (b.nextFollowUpAt?.getTime() ?? 0);
    if (dateDiff !== 0) return dateDiff;
    const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return statusRank[a.status] - statusRank[b.status];
  });
};

export const getAnalytics = async (actor: AuthUser) => {
  const match = actor.role === "sales" ? { assignedTo: actor._id } : {};
  const [byStatus, bySource, followUps, total] = await Promise.all([
    Lead.aggregate<{ _id: string; count: number }>([{ $match: match }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Lead.aggregate<{ _id: string; count: number }>([{ $match: match }, { $group: { _id: "$source", count: { $sum: 1 } } }]),
    getFollowUps(actor),
    Lead.countDocuments(match)
  ]);

  const now = new Date();
  const today = startOfToday();
  const tomorrow = startOfTomorrow();
  return {
    total,
    byStatus: byStatus.map((row) => ({ label: row._id, value: row.count })),
    bySource: bySource.map((row) => ({ label: row._id, value: row.count })),
    followUps: {
      overdue: followUps.filter((lead) => lead.nextFollowUpAt && lead.nextFollowUpAt < today).length,
      today: followUps.filter((lead) => lead.nextFollowUpAt && lead.nextFollowUpAt >= today && lead.nextFollowUpAt < tomorrow).length,
      upcoming: followUps.filter((lead) => lead.nextFollowUpAt && lead.nextFollowUpAt > now).length
    },
    funnel: LEAD_STATUSES.map((status) => ({ label: status, value: byStatus.find((row) => row._id === status)?.count ?? 0 }))
  };
};

export const getTeamWorkload = async () => {
  const salesUsers = await User.find({ role: "sales" }).sort({ name: 1 });
  return Promise.all(
    salesUsers.map(async (user) => {
      const [assigned, active, qualified, lost, followUpsDue, reviewedLeads, activityCount, lastActivity] = await Promise.all([
        Lead.countDocuments({ assignedTo: user._id }),
        Lead.countDocuments({ assignedTo: user._id, status: { $in: ACTIVE_LEAD_STATUSES } }),
        Lead.countDocuments({ assignedTo: user._id, status: "Qualified" }),
        Lead.countDocuments({ assignedTo: user._id, status: "Lost" }),
        Lead.countDocuments({ assignedTo: user._id, nextFollowUpAt: { $lte: startOfTomorrow() } }),
        LeadActivity.distinct("lead", { actor: user._id, type: { $in: reviewActivityTypes } }),
        LeadActivity.countDocuments({ actor: user._id, type: { $in: reviewActivityTypes } }),
        LeadActivity.findOne({ actor: user._id }).sort({ createdAt: -1 }).select("createdAt")
      ]);
      return {
        user: { _id: user._id, name: user.name, email: user.email },
        assigned,
        active,
        qualified,
        lost,
        followUpsDue,
        reviewed: reviewedLeads.length,
        activityCount,
        lastActivityAt: lastActivity?.createdAt
      };
    })
  );
};
