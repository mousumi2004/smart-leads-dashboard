import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export const LEAD_ACTIVITY_TYPES = [
  "lead_created",
  "assigned",
  "status_changed",
  "priority_changed",
  "follow_up_scheduled",
  "note_added"
] as const;

export type LeadActivityType = (typeof LEAD_ACTIVITY_TYPES)[number];

export interface LeadActivityAttrs {
  lead: Types.ObjectId;
  actor: Types.ObjectId;
  type: LeadActivityType;
  message: string;
  note?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadActivityDocument = HydratedDocument<LeadActivityAttrs>;

const leadActivitySchema = new Schema<LeadActivityAttrs>(
  {
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: LEAD_ACTIVITY_TYPES, required: true },
    message: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    oldValue: { type: String, trim: true },
    newValue: { type: String, trim: true }
  },
  { timestamps: true }
);

leadActivitySchema.index({ lead: 1, createdAt: -1 });
leadActivitySchema.index({ actor: 1, createdAt: -1 });
leadActivitySchema.index({ actor: 1, type: 1 });

export const LeadActivity = model<LeadActivityAttrs>("LeadActivity", leadActivitySchema);
