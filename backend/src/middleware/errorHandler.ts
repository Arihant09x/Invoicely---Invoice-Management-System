import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";
import { httpStatus } from "../utils/httpStatus";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
      message: "Validation failed",
      errors: err.flatten(),
    });
  }

  // Our explicit errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details ?? null,
    });
  }

  // Unknown errors
  console.error(err);
  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message: "Internal server error",
  });
}
