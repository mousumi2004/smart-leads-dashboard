import { Router } from "express";
import * as leadController from "../controllers/lead.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  addActivitySchema,
  createLeadSchema,
  followUpListSchema,
  leadExportSchema,
  leadIdSchema,
  leadListSchema,
  updateLeadSchema
} from "../validators/lead.validator.js";

export const leadRouter = Router();

leadRouter.use(authenticate);
leadRouter.get("/", validate(leadListSchema), leadController.listLeads);
leadRouter.post("/", validate(createLeadSchema), leadController.createLead);
leadRouter.get("/stats", leadController.stats);
leadRouter.get("/follow-ups", validate(followUpListSchema), leadController.followUps);
leadRouter.get("/export/csv", requireRole("admin"), validate(leadExportSchema), leadController.exportCsv);
leadRouter.get("/:id/activities", validate(leadIdSchema), leadController.activities);
leadRouter.post("/:id/activities", validate(addActivitySchema), leadController.addNote);
leadRouter.get("/:id", validate(leadIdSchema), leadController.getLead);
leadRouter.put("/:id", validate(updateLeadSchema), leadController.updateLead);
leadRouter.delete("/:id", requireRole("admin"), validate(leadIdSchema), leadController.deleteLead);
