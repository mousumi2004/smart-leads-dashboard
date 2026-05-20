import { Schema, model, type HydratedDocument } from "mongoose";
import { USER_ROLES, type UserRole } from "../constants/roles.js";

export interface UserAttrs {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export type UserDocument = HydratedDocument<UserAttrs>;

const userSchema = new Schema<UserAttrs>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, required: true }
  },
  { timestamps: true }
);

export const User = model<UserAttrs>("User", userSchema);
