import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import {
  FOLLOW_UP_TYPES,
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  type FollowUpType,
  type LeadPriority,
  type LeadSource,
  type LeadStatus
} from "../constants/lead.js";

export interface LeadAttrs {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  priority: LeadPriority;
  nextFollowUpAt?: Date;
  followUpType?: FollowUpType;
  followUpNote?: string;
  lastContactedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadDocument = HydratedDocument<LeadAttrs>;

const leadSchema = new Schema<LeadAttrs>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    status: { type: String, enum: LEAD_STATUSES, required: true },
    source: { type: String, enum: LEAD_SOURCES, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    priority: { type: String, enum: LEAD_PRIORITIES, default: "Medium", required: true },
    nextFollowUpAt: { type: Date },
    followUpType: { type: String, enum: FOLLOW_UP_TYPES },
    followUpNote: { type: String, trim: true },
    lastContactedAt: { type: Date }
  },
  { timestamps: true }
);

leadSchema.index({ name: "text", email: "text" });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ nextFollowUpAt: 1 });

export const Lead = model<LeadAttrs>("Lead", leadSchema);
