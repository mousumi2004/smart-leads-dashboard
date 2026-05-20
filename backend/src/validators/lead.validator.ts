import { z } from "zod";
import { FOLLOW_UP_TYPES, LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUSES } from "../constants/lead.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Valid id is required");

const leadBody = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email is required").transform((value) => value.toLowerCase()),
  status: z.enum(LEAD_STATUSES),
  source: z.enum(LEAD_SOURCES),
  assignedTo: objectId.optional().or(z.literal("")),
  priority: z.enum(LEAD_PRIORITIES).optional(),
  nextFollowUpAt: z.string().datetime().optional().or(z.literal("")),
  followUpType: z.enum(FOLLOW_UP_TYPES).optional().or(z.literal("")),
  followUpNote: z.string().trim().max(500).optional(),
  statusNote: z.string().trim().max(500).optional()
});

export const createLeadSchema = z.object({ body: leadBody });

export const updateLeadSchema = z.object({
  params: z.object({ id: objectId }),
  body: leadBody.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required")
});

export const leadIdSchema = z.object({
  params: z.object({ id: objectId })
});

const numberParam = (defaultValue: number) =>
  z
    .preprocess((value) => (value === undefined ? defaultValue : Number(value)), z.number().int().positive())
    .default(defaultValue);

export const leadListSchema = z.object({
  query: z.object({
    status: z.enum(LEAD_STATUSES).optional(),
    source: z.enum(LEAD_SOURCES).optional(),
    search: z.string().trim().optional(),
    sort: z.enum(["latest", "oldest"]).optional().default("latest"),
    page: numberParam(1),
    limit: numberParam(10).refine((value) => value <= 100, "Limit cannot exceed 100")
  })
});

export const leadExportSchema = z.object({
  query: z.object({
    status: z.enum(LEAD_STATUSES).optional(),
    source: z.enum(LEAD_SOURCES).optional(),
    search: z.string().trim().optional()
  })
});

export const addActivitySchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    note: z.string().trim().min(1, "Note is required").max(500)
  })
});

export const followUpListSchema = z.object({
  query: z.object({
    scope: z.enum(["overdue", "today", "upcoming"]).optional()
  })
});
