import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // The session is synchronously rehydrated from localStorage at module load
  // (see useAuth), so `isAuthenticated` is trustworthy on first render.
  // No loading flash needed — just redirect logged-out users to /login.
  if (!isAuthenticated) {
    const next = `${location.pathname}${location.search}`;
    return (
      <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
    );
  }

  return <Outlet />;
}