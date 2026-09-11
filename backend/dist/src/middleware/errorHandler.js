"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const appError_1 = require("../utils/appError");
const httpStatus_1 = require("../utils/httpStatus");
function errorHandler(err, _req, res, _next) {
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        return res.status(httpStatus_1.httpStatus.UNPROCESSABLE_ENTITY).json({
            message: "Validation failed",
            errors: err.flatten(),
        });
    }
    // Our explicit errors
    if (err instanceof appError_1.AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            details: err.details ?? null,
        });
    }
    // Unknown errors
    console.error(err);
    return res.status(httpStatus_1.httpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
    });
}
