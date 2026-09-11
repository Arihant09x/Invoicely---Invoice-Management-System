"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
const appError_1 = require("../utils/appError");
const httpStatus_1 = require("../utils/httpStatus");
function authorize(...roles) {
    return (req, _res, next) => {
        if (!req.user)
            return next(new appError_1.AppError("Unauthorized", httpStatus_1.httpStatus.UNAUTHORIZED));
        if (!roles.includes(req.user.role)) {
            return next(new appError_1.AppError("Forbidden", httpStatus_1.httpStatus.FORBIDDEN));
        }
        next();
    };
}
