"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const httpStatus_1 = require("./httpStatus");
class AppError extends Error {
    statusCode;
    details;
    constructor(message, statusCode = httpStatus_1.httpStatus.BAD_REQUEST, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}
exports.AppError = AppError;
