import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as leadService from "../services/lead.service.js";

export const analytics = asyncHandler(async (req, res) => {
  const data = await leadService.getAnalytics(req.user!);
  return sendSuccess(res, 200, "Analytics retrieved", data);
});

export const team = asyncHandler(async (_req, res) => {
  const data = await leadService.getTeamWorkload();
  return sendSuccess(res, 200, "Team workload retrieved", data);
});
