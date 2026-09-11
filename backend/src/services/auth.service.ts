import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { AppError } from "../utils/appError";
import { httpStatus } from "../utils/httpStatus";

export class AuthService {
  static async register(input: {
    email: string;
    password: string;
    name: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing)
      throw new AppError("Email already in use", httpStatus.CONFLICT);

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        role: Role.USER,
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

  static async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user)
      throw new AppError("Invalid credentials", httpStatus.UNAUTHORIZED);

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new AppError("Invalid credentials", httpStatus.UNAUTHORIZED);

    // Use non-null assertion or fallback values
    const secret = env.JWT_ACCESS_SECRET!; // or env.JWT_ACCESS_SECRET as string
    const expires = env.JWT_ACCESS_EXPIRES_IN!; // or '1d' as fallback

    if (!secret || !expires) {
      throw new Error("Missing JWT_ACCESS_SECRET or JWT_ACCESS_EXPIRES_IN");
    }

    const options: SignOptions = {
      expiresIn: expires as SignOptions["expiresIn"],
    };
    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      secret,
      options,
    );

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
