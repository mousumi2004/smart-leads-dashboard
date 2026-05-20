import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);
analyticsRouter.get("/", analyticsController.analytics);
analyticsRouter.get("/team", requireRole("admin"), analyticsController.team);
