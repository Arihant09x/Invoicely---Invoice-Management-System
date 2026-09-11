import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";
import { AppError } from "../utils/appError";
import { httpStatus } from "../utils/httpStatus";

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user)
      return next(new AppError("Unauthorized", httpStatus.UNAUTHORIZED));
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", httpStatus.FORBIDDEN));
    }
    next();
  };
}
