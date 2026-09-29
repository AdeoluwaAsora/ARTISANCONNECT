import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "@/types/auth";
import {
  getCurrentUser,
  subscribeToSession,
  clearSession,
  restoreSession,
} from "./authSession";

interface AuthContextValue {
  user: AuthUser | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToSession(setUser);
    restoreSession().finally(() => setIsInitializing(false));
    return unsubscribe;
  }, []);

  const logout = () => clearSession();

  return (
    <AuthContext.Provider
      value={{ user, isInitializing, isAuthenticated: user !== null, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
