import type { Request, Response, NextFunction } from "express";
import { httpStatus } from "../utils/httpStatus";
import { InvoiceService } from "../services/invoice.service";
import { ExportService } from "../services/export.service";
import { AppError } from "../utils/appError";
import { Role } from "@prisma/client";

export class InvoiceController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        throw new AppError("Unauthorized", httpStatus.UNAUTHORIZED);

      const page = Number(req.query.page ?? 1);
      const limit = Math.min(Number(req.query.limit ?? 10), 100);
      const sortBy = String(req.query.sortBy ?? "createdAt");
      const sortOrder = String(req.query.sortOrder ?? "desc") as "asc" | "desc";
      const q = req.query.q ? String(req.query.q) : undefined;
      const status = req.query.status
        ? (String(req.query.status) as any)
        : undefined;
      const dateFrom = req.query.dateFrom
        ? String(req.query.dateFrom)
        : undefined;
      const dateTo = req.query.dateTo ? String(req.query.dateTo) : undefined;

      const result = await InvoiceService.list({
        userId: req.user.id,
        role: req.user.role,
        page,
        limit,
        sortBy,
        sortOrder,
        q,
        status,
        dateFrom,
        dateTo,
      });

      return res.status(httpStatus.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        throw new AppError("Unauthorized", httpStatus.UNAUTHORIZED);

      // Fix: cast req.params.id to string
      const invoice = await InvoiceService.getById({
        id: req.params.id as string,
        userId: req.user.id,
        role: req.user.role,
      });
      return res.status(httpStatus.OK).json({ invoice });
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        throw new AppError("Unauthorized", httpStatus.UNAUTHORIZED);
      const invoice = await InvoiceService.create({
        userId: req.user.id,
        input: req.body,
      });
      return res.status(httpStatus.CREATED).json({ invoice });
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        throw new AppError("Unauthorized", httpStatus.UNAUTHORIZED);

      // Fix: cast req.params.id to string
      const invoice = await InvoiceService.update({
        id: req.params.id as string,
        userId: req.user.id,
        role: req.user.role,
        input: req.body,
      });
      return res.status(httpStatus.OK).json({ invoice });
    } catch (e) {
      next(e);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        throw new AppError("Unauthorized", httpStatus.UNAUTHORIZED);
      if (req.user.role !== Role.ADMIN)
        throw new AppError("Forbidden", httpStatus.FORBIDDEN);

      const hard = req.query.hard === "true";
      const id = req.params.id as string; // Fix

      const result = hard
        ? await InvoiceService.deleteHard({ id })
        : await InvoiceService.deleteSoft({ id });

      return res.status(httpStatus.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async bulk(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        throw new AppError("Unauthorized", httpStatus.UNAUTHORIZED);

      const result = await InvoiceService.bulk({
        ids: req.body.ids,
        action: req.body.action,
        status: req.body.status,
        userId: req.user.id,
        role: req.user.role,
      });

      return res.status(httpStatus.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        throw new AppError("Unauthorized", httpStatus.UNAUTHORIZED);

      const q = req.query.q ? String(req.query.q) : undefined;
      const status = req.query.status
        ? (String(req.query.status) as any)
        : undefined;
      const dateFrom = req.query.dateFrom
        ? String(req.query.dateFrom)
        : undefined;
      const dateTo = req.query.dateTo ? String(req.query.dateTo) : undefined;

      const csv = await ExportService.exportCsv({
        userId: req.user.id,
        role: req.user.role,
        q,
        status,
        dateFrom,
        dateTo,
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="invoices.csv"`,
      );
      return res.status(httpStatus.OK).send(csv);
    } catch (e) {
      next(e);
    }
  }
}
