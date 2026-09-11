"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const httpStatus_1 = require("../utils/httpStatus");
const invoice_service_1 = require("../services/invoice.service");
const export_service_1 = require("../services/export.service");
const appError_1 = require("../utils/appError");
const client_1 = require("@prisma/client");
class InvoiceController {
    static async list(req, res, next) {
        try {
            if (!req.user)
                throw new appError_1.AppError("Unauthorized", httpStatus_1.httpStatus.UNAUTHORIZED);
            const page = Number(req.query.page ?? 1);
            const limit = Math.min(Number(req.query.limit ?? 10), 100);
            const sortBy = String(req.query.sortBy ?? "createdAt");
            const sortOrder = String(req.query.sortOrder ?? "desc");
            const q = req.query.q ? String(req.query.q) : undefined;
            const status = req.query.status
                ? String(req.query.status)
                : undefined;
            const dateFrom = req.query.dateFrom
                ? String(req.query.dateFrom)
                : undefined;
            const dateTo = req.query.dateTo ? String(req.query.dateTo) : undefined;
            const result = await invoice_service_1.InvoiceService.list({
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
            return res.status(httpStatus_1.httpStatus.OK).json(result);
        }
        catch (e) {
            next(e);
        }
    }
    static async getById(req, res, next) {
        try {
            if (!req.user)
                throw new appError_1.AppError("Unauthorized", httpStatus_1.httpStatus.UNAUTHORIZED);
            // Fix: cast req.params.id to string
            const invoice = await invoice_service_1.InvoiceService.getById({
                id: req.params.id,
                userId: req.user.id,
                role: req.user.role,
            });
            return res.status(httpStatus_1.httpStatus.OK).json({ invoice });
        }
        catch (e) {
            next(e);
        }
    }
    static async create(req, res, next) {
        try {
            if (!req.user)
                throw new appError_1.AppError("Unauthorized", httpStatus_1.httpStatus.UNAUTHORIZED);
            const invoice = await invoice_service_1.InvoiceService.create({
                userId: req.user.id,
                input: req.body,
            });
            return res.status(httpStatus_1.httpStatus.CREATED).json({ invoice });
        }
        catch (e) {
            next(e);
        }
    }
    static async update(req, res, next) {
        try {
            if (!req.user)
                throw new appError_1.AppError("Unauthorized", httpStatus_1.httpStatus.UNAUTHORIZED);
            // Fix: cast req.params.id to string
            const invoice = await invoice_service_1.InvoiceService.update({
                id: req.params.id,
                userId: req.user.id,
                role: req.user.role,
                input: req.body,
            });
            return res.status(httpStatus_1.httpStatus.OK).json({ invoice });
        }
        catch (e) {
            next(e);
        }
    }
    static async delete(req, res, next) {
        try {
            if (!req.user)
                throw new appError_1.AppError("Unauthorized", httpStatus_1.httpStatus.UNAUTHORIZED);
            if (req.user.role !== client_1.Role.ADMIN)
                throw new appError_1.AppError("Forbidden", httpStatus_1.httpStatus.FORBIDDEN);
            const hard = req.query.hard === "true";
            const id = req.params.id; // Fix
            const result = hard
                ? await invoice_service_1.InvoiceService.deleteHard({ id })
                : await invoice_service_1.InvoiceService.deleteSoft({ id });
            return res.status(httpStatus_1.httpStatus.OK).json(result);
        }
        catch (e) {
            next(e);
        }
    }
    static async bulk(req, res, next) {
        try {
            if (!req.user)
                throw new appError_1.AppError("Unauthorized", httpStatus_1.httpStatus.UNAUTHORIZED);
            const result = await invoice_service_1.InvoiceService.bulk({
                ids: req.body.ids,
                action: req.body.action,
                status: req.body.status,
                userId: req.user.id,
                role: req.user.role,
            });
            return res.status(httpStatus_1.httpStatus.OK).json(result);
        }
        catch (e) {
            next(e);
        }
    }
    static async exportCsv(req, res, next) {
        try {
            if (!req.user)
                throw new appError_1.AppError("Unauthorized", httpStatus_1.httpStatus.UNAUTHORIZED);
            const q = req.query.q ? String(req.query.q) : undefined;
            const status = req.query.status
                ? String(req.query.status)
                : undefined;
            const dateFrom = req.query.dateFrom
                ? String(req.query.dateFrom)
                : undefined;
            const dateTo = req.query.dateTo ? String(req.query.dateTo) : undefined;
            const csv = await export_service_1.ExportService.exportCsv({
                userId: req.user.id,
                role: req.user.role,
                q,
                status,
                dateFrom,
                dateTo,
            });
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="invoices.csv"`);
            return res.status(httpStatus_1.httpStatus.OK).send(csv);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.InvoiceController = InvoiceController;
