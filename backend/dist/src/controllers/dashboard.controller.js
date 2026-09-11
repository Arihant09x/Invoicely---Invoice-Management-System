"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const appError_1 = require("../utils/appError");
const httpStatus_1 = require("../utils/httpStatus");
class DashboardController {
    static async stats(req, res, next) {
        try {
            if (!req.user)
                throw new appError_1.AppError("Unauthorized", httpStatus_1.httpStatus.UNAUTHORIZED);
            const stats = await dashboard_service_1.DashboardService.overview({
                userId: req.user.id,
                role: req.user.role,
            });
            return res.status(httpStatus_1.httpStatus.OK).json({ stats });
        }
        catch (e) {
            next(e);
        }
    }
    static async overview(req, res, next) {
        try {
            if (!req.user)
                throw new appError_1.AppError("Unauthorized", httpStatus_1.httpStatus.UNAUTHORIZED);
            const dateFrom = req.query.dateFrom
                ? String(req.query.dateFrom)
                : undefined;
            const dateTo = req.query.dateTo ? String(req.query.dateTo) : undefined;
            const groupBy = req.query.groupBy
                ? String(req.query.groupBy)
                : undefined;
            const data = await dashboard_service_1.DashboardService.overview({
                userId: req.user.id,
                role: req.user.role,
                dateFrom,
                dateTo,
                groupBy,
            });
            return res.status(httpStatus_1.httpStatus.OK).json(data);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.DashboardController = DashboardController;
