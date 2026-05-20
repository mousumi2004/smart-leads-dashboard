import jwt from "jsonwebtoken";
import type { Types } from "mongoose";
import { env } from "../config/env.js";
import type { UserRole } from "../constants/roles.js";

interface JwtPayload {
  sub: string;
  role: UserRole;
}

export const signAuthToken = (user: { _id: Types.ObjectId; role: UserRole }) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });

export const verifyAuthToken = (token: string) => jwt.verify(token, env.jwtSecret) as JwtPayload;
