import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { httpStatus } from "../utils/httpStatus";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const user = await AuthService.register({ email, password, name });
      return res.status(httpStatus.CREATED).json({ user });
    } catch (e) {
      next(e);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      return res.status(httpStatus.OK).json(result);
    } catch (e) {
      next(e);
    }
  }
}
