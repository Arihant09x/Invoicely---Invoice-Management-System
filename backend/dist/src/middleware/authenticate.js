"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt = __importStar(require("jsonwebtoken"));
const env_1 = require("../config/env");
const prisma_1 = require("../config/prisma");
const appError_1 = require("../utils/appError");
const httpStatus_1 = require("../utils/httpStatus");
async function authenticate(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return next(new appError_1.AppError("Missing Authorization header", httpStatus_1.httpStatus.UNAUTHORIZED));
    }
    const token = header.slice("Bearer ".length);
    try {
        const decoded = jwt.verify(token, env_1.env.JWT_ACCESS_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.sub },
            select: { id: true, role: true, email: true, name: true },
        });
        if (!user)
            return next(new appError_1.AppError("User not found", httpStatus_1.httpStatus.UNAUTHORIZED));
        req.user = user;
        return next();
    }
    catch {
        return next(new appError_1.AppError("Invalid or expired token", httpStatus_1.httpStatus.UNAUTHORIZED));
    }
}
