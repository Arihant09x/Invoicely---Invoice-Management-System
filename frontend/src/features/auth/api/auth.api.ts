import { api } from "@/lib/api-client";
import type { LoginResponse, RegisterResponse } from "@/types/user";

export const authApi = {
  login: async (payload: { email: string; password: string }) =>
    (await api.post<LoginResponse>("/auth/login", payload)).data,

  register: async (payload: {
    email: string;
    password: string;
    name: string;
  }) => (await api.post<RegisterResponse>("/auth/register", payload)).data,
};
