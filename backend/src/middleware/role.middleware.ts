import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../constants/roles.js";
import { AppError } from "../utils/apiResponse.js";

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }
    next();
  };
