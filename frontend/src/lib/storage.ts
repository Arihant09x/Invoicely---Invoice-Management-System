const TOKEN_KEY = "invoicely.token";
const USER_KEY = "invoicely.user";

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  getUser: <T>(): T | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Corrupt persisted session — drop it rather than crashing the app.
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  setUser: (u: unknown) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
