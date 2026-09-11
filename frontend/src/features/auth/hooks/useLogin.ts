import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import type { ApiError } from "@/lib/api-client";
import type { LoginResponse } from "@/types/user";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

/** Sign-in mutation. Pass onSuccess/onError via `mutate(values, {...})`. */
export function useLogin() {
  return useMutation<LoginResponse, ApiError, LoginInput>({
    mutationFn: (payload) => authApi.login(payload),
  });
}

/** Register + auto sign-in mutation. */
export function useRegister() {
  return useMutation<LoginResponse, ApiError, RegisterInput>({
    mutationFn: async (payload) => {
      await authApi.register(payload);
      return authApi.login({ email: payload.email, password: payload.password });
    },
  });
}