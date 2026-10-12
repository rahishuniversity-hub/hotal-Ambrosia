/* ═══════════════════════════════════════════
   Admin Dashboard — Auth Utilities
   Supabase Auth Integration
   ═══════════════════════════════════════════ */

import { supabase } from "./supabase";
import type { AdminUser } from "./types";

const SESSION_KEY = "admin-session";
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

/* ── Password hashing (retained for store seed & backwards compatibility) ── */

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/* ── Session management ── */

interface Session {
  email: string;
  loginTime: number;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session: Session = JSON.parse(raw);
    const elapsed = Date.now() - session.loginTime;

    if (elapsed > SESSION_DURATION) {
      localStorage.removeItem(SESSION_KEY);
      document.cookie = "admin-session=; path=/; max-age=0";
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/* ── Supabase Authentication ── */

export async function login(email: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      console.error("Supabase login error:", error?.message);
      return false;
    }

    const session: Session = {
      email: data.user.email || email,
      loginTime: Date.now(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      // Set cookie so proxy (server-side) can verify admin access
      document.cookie = `admin-session=${encodeURIComponent(
        JSON.stringify(session)
      )}; path=/; max-age=${SESSION_DURATION / 1000}; SameSite=Lax`;
    }

    return true;
  } catch (err) {
    console.error("Login exception:", err);
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
      document.cookie = "admin-session=; path=/; max-age=0";
    }
  }
}

// Re-export AdminUser so AuthProvider can import it from here
export type { AdminUser };
