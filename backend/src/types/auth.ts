import type { Role } from "@prisma/client";

export type JwtPayload = {
  sub: string; // userId
  role: Role;
};

export type AuthUser = {
  id: string;
  role: Role;
  email: string;
  name: string | null;
};
