import type { Types } from "mongoose";
import type { UserRole } from "../constants/roles.js";

export interface AuthUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: UserRole;
}
