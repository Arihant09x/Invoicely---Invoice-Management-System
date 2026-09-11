import type { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";
import { httpStatus } from "../utils/httpStatus";
import type { JwtPayload, AuthUser } from "../types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(
      new AppError("Missing Authorization header", httpStatus.UNAUTHORIZED),
    );
  }

  const token = header.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true, email: true, name: true },
    });

    if (!user)
      return next(new AppError("User not found", httpStatus.UNAUTHORIZED));

    req.user = user;
    return next();
  } catch {
    return next(
      new AppError("Invalid or expired token", httpStatus.UNAUTHORIZED),
    );
  }
}
