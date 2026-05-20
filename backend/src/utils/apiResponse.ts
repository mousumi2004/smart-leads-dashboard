import type { Response } from "express";
import type { ApiSuccess } from "../types/api.js";

export class AppError extends Error {
  statusCode: number;
  errors?: Array<{ field?: string; message: string }>;

  constructor(message: string, statusCode = 500, errors?: Array<{ field?: string; message: string }>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const sendSuccess = <TData, TMeta = undefined>(
  res: Response,
  statusCode: number,
  message: string,
  data: TData,
  meta?: TMeta
) => {
  const body: ApiSuccess<TData, TMeta> = { success: true, message, data };
  if (meta !== undefined) {
    body.meta = meta;
  }
  return res.status(statusCode).json(body);
};
