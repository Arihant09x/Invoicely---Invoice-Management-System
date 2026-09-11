/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from "react";
import { create } from "zustand";
import { useStore } from "zustand";
import { storage } from "@/lib/storage";
import type { User } from "@/types/user";

interface AuthState {
  token: string | null;
  user: User | null;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
}

function loadInitialSession(): { token: string | null; user: User | null } {
  try {
    const token = storage.getToken();
    const user = storage.getUser<User>();
    // Both halves of the session must exist — a token without a user (or
    // vice versa) is treated as logged-out instead of half-authenticated.
    if (token && user) return { token, user };
    return { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

const initial = loadInitialSession();

export const authStore = create<AuthState>((set) => ({
  token: initial.token,
  user: initial.user,
  signIn: (token, user) => {
    storage.setToken(token);
    storage.setUser(user);
    set({ token, user });
  },
  signOut: () => {
    storage.clear();
    set({ token: null, user: null });
  },
}));

export interface AuthContextValue {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Subscribe via useSyncExternalStore semantics: Zustand's useStore keeps
  // every consumer in sync without the mount-time setState loop that used
  // to re-render (and briefly de-auth) the tree on navigation.
  const snapshot = useStore(authStore);
  const value: AuthContextValue = {
    token: snapshot.token,
    user: snapshot.user,
    isAuthenticated: snapshot.token !== null && snapshot.user !== null,
    isAdmin: snapshot.user?.role === "ADMIN",
    signIn: snapshot.signIn,
    signOut: snapshot.signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
