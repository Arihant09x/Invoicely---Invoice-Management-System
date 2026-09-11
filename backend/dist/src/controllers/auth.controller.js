"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const httpStatus_1 = require("../utils/httpStatus");
class AuthController {
    static async register(req, res, next) {
        try {
            const { email, password, name } = req.body;
            const user = await auth_service_1.AuthService.register({ email, password, name });
            return res.status(httpStatus_1.httpStatus.CREATED).json({ user });
        }
        catch (e) {
            next(e);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.AuthService.login({ email, password });
            return res.status(httpStatus_1.httpStatus.OK).json(result);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.AuthController = AuthController;
