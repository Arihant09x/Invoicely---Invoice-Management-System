"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
const env_1 = require("../config/env");
const appError_1 = require("../utils/appError");
const httpStatus_1 = require("../utils/httpStatus");
class AuthService {
    static async register(input) {
        const existing = await prisma_1.prisma.user.findUnique({
            where: { email: input.email },
        });
        if (existing)
            throw new appError_1.AppError("Email already in use", httpStatus_1.httpStatus.CONFLICT);
        const passwordHash = await bcryptjs_1.default.hash(input.password, 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                name: input.name,
                role: client_1.Role.USER,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        return user;
    }
    static async login(input) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: input.email },
        });
        if (!user)
            throw new appError_1.AppError("Invalid credentials", httpStatus_1.httpStatus.UNAUTHORIZED);
        const ok = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!ok)
            throw new appError_1.AppError("Invalid credentials", httpStatus_1.httpStatus.UNAUTHORIZED);
        // Use non-null assertion or fallback values
        const secret = env_1.env.JWT_ACCESS_SECRET; // or env.JWT_ACCESS_SECRET as string
        const expires = env_1.env.JWT_ACCESS_EXPIRES_IN; // or '1d' as fallback
        if (!secret || !expires) {
            throw new Error("Missing JWT_ACCESS_SECRET or JWT_ACCESS_EXPIRES_IN");
        }
        const options = {
            expiresIn: expires,
        };
        const accessToken = jsonwebtoken_1.default.sign({ sub: user.id, role: user.role }, secret, options);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }
}
exports.AuthService = AuthService;
