import type { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";
import { AppError } from "../utils/appError";
import { httpStatus } from "../utils/httpStatus";

export class DashboardController {
  static async stats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        throw new AppError("Unauthorized", httpStatus.UNAUTHORIZED);
      const stats = await DashboardService.overview({
        userId: req.user.id,
        role: req.user.role,
      });
      return res.status(httpStatus.OK).json({ stats });
    } catch (e) {
      next(e);
    }
  }

  static async overview(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        throw new AppError("Unauthorized", httpStatus.UNAUTHORIZED);

      const dateFrom = req.query.dateFrom
        ? String(req.query.dateFrom)
        : undefined;
      const dateTo = req.query.dateTo ? String(req.query.dateTo) : undefined;
      const groupBy = req.query.groupBy
        ? (String(req.query.groupBy) as any)
        : undefined;

      const data = await DashboardService.overview({
        userId: req.user.id,
        role: req.user.role,
        dateFrom,
        dateTo,
        groupBy,
      });

      return res.status(httpStatus.OK).json(data);
    } catch (e) {
      next(e);
    }
  }
}
