import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const salesUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: "sales" }).select("name email role").sort({ name: 1 });
  return sendSuccess(res, 200, "Sales users retrieved", users);
});
