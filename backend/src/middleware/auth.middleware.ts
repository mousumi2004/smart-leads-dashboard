import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User.js";
import { AppError } from "../utils/apiResponse.js";
import { verifyAuthToken } from "../utils/jwt.js";

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = header.slice("Bearer ".length);
    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AppError("Authentication required", 401);
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Authentication required", 401));
  }
};
