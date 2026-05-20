import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.get("/sales", requireRole("admin"), userController.salesUsers);
