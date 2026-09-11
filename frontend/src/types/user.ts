export type Role = "ADMIN" | "USER";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  user: User & { createdAt: string };
}
