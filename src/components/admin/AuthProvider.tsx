"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { login as loginFn, logout as logoutFn, type AdminUser } from "@/lib/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser({
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Admin",
        });
        const sessionData = { email: session.user.email, loginTime: Date.now() };
        localStorage.setItem("admin-session", JSON.stringify(sessionData));
        document.cookie = `admin-session=${encodeURIComponent(
          JSON.stringify(sessionData)
        )}; path=/; max-age=${8 * 3600}; SameSite=Lax`;
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    });

    // 2. Listen to Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser({
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Admin",
        });
        const sessionData = { email: session.user.email, loginTime: Date.now() };
        localStorage.setItem("admin-session", JSON.stringify(sessionData));
        document.cookie = `admin-session=${encodeURIComponent(
          JSON.stringify(sessionData)
        )}; path=/; max-age=${8 * 3600}; SameSite=Lax`;
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("admin-session");
        document.cookie = "admin-session=; path=/; max-age=0";
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    return await loginFn(email, password);
  };

  const logout = () => {
    logoutFn().catch(console.error);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
