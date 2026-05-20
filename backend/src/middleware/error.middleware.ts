import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/apiResponse.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {})
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }

  return res.status(500).json({ success: false, message: "Internal server error" });
};
