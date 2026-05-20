import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as authService from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  return sendSuccess(res, 201, "Registration successful", data);
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  return sendSuccess(res, 200, "Login successful", data);
});

export const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, "Current user", req.user);
});
