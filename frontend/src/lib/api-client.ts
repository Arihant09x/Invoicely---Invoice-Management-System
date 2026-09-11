import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { storage } from "./storage";
import type { ApiErrorBody } from "@/types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

// Attach the JWT (if any) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize non-2xx responses into ApiError and handle 401/429/5xx globally.
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";
    const body = error.response?.data;

    if (status === 401) {
      // The login/register endpoints themselves return 401 on bad
      // credentials — that must NOT nuke the session or redirect, or the
      // user gets bounced to /login while already ON /login.
      const isAuthCall =
        url.includes("/auth/login") || url.includes("/auth/register");
      if (!isAuthCall) {
        // Only treat it as "session expired" when the failed request
        // actually carried a token. Background retries fired after an
        // explicit sign-out (no Authorization header) must not toast or
        // force navigation — ProtectedRoute already handles logged-out.
        const sentAuth =
          error.config?.headers?.Authorization != null ||
          storage.getToken() != null;
        if (sentAuth) {
          const onAuthPage = ["/login", "/register"].includes(
            window.location.pathname,
          );
          storage.clear();
          // Also reset the in-memory session so the UI (avatar, guards)
          // reflects logged-out immediately instead of lingering.
          try {
            const { authStore } = await import(
              "@/features/auth/hooks/useAuth"
            );
            authStore.getState().signOut();
          } catch {
            /* store not yet loaded — storage.clear() is enough */
          }
          // Guard against toast/redirect storms when several queries fail
          // with 401 at once (dashboard + invoices firing together).
          if (!onAuthPage && !window.__authRedirecting) {
            window.__authRedirecting = true;
            toast.error("Session expired. Please sign in again.");
            window.location.replace(
              `/login?next=${encodeURIComponent(window.location.pathname)}`,
            );
            // Hold the flag until the login page loads (full page replace).
            setTimeout(() => {
              window.__authRedirecting = false;
            }, 3000);
          }
        }
      }
    }

    if (status === 429) toast.error("Too many requests. Slow down a bit.");
    if (status && status >= 500) toast.error("Server error. Please try again.");

    throw new ApiError(body?.message ?? error.message, status, body);
  },
);

declare global {
  // Cross-request guard so N concurrent 401s only toast/redirect once.
  var __authRedirecting: boolean | undefined;
}

export class ApiError extends Error {
  status?: number;
  body?: ApiErrorBody;

  constructor(message: string, status?: number, body?: ApiErrorBody) {
    super(message);
    this.status = status;
    this.body = body;
  }

  /** Flatten zod fieldErrors from the backend errorHandler. */
  get fieldErrors(): Record<string, string> {
    const fe = this.body?.errors?.fieldErrors ?? {};
    return Object.fromEntries(
      Object.entries(fe).map(([k, v]) => [
        k,
        Array.isArray(v) ? v[0] : String(v),
      ]),
    );
  }
}
