"use client";

import { useCallback, useEffect, useState } from "react";
import { clearSession, readSession } from "./session";
import type { Session } from "./types";

/**
 * Lightweight auth state for components that need the current user
 * (top bar, settings, onboarding nudge). Reads the session from
 * localStorage on mount. Sign-out clears the session + uid cookie and
 * hard-navigates to /login so every per-user key resets cleanly.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(readSession());
    setHydrated(true);
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    if (typeof window !== "undefined") window.location.assign("/login");
  }, []);

  return {
    session,
    user: session?.user ?? null,
    hydrated,
    signedIn: Boolean(session),
    signOut,
  };
}
