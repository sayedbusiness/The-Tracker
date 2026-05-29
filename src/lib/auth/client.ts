/**
 * Email/password auth client.
 *
 * Talks to Supabase GoTrue (the `/auth/v1` REST endpoints) directly so
 * there's no SDK dependency and it works everywhere. When Supabase isn't
 * configured, it falls back to a local account store in localStorage so
 * the full register → onboarding → login flow still works for dev/demo.
 */
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseAuthConfigured } from "@/lib/supabase/config";
import type { Session } from "./types";

export class AuthError extends Error {}

interface GoTrueTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: { id?: string; email?: string };
  error?: string;
  error_description?: string;
  msg?: string;
  message?: string;
}

function tokenToSession(data: GoTrueTokenResponse): Session | null {
  if (!data.access_token || !data.user?.id) return null;
  return {
    user: { id: data.user.id, email: data.user.email ?? "" },
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
    mode: "supabase",
  };
}

function errMessage(data: GoTrueTokenResponse, fallback: string): string {
  return (
    data.error_description || data.msg || data.message || data.error || fallback
  );
}

async function supabaseSignIn(email: string, password: string): Promise<Session> {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }
  );
  const data = (await res.json().catch(() => ({}))) as GoTrueTokenResponse;
  if (!res.ok) {
    throw new AuthError(errMessage(data, "Invalid email or password."));
  }
  const session = tokenToSession(data);
  if (!session) throw new AuthError("Sign-in failed — no session returned.");
  return session;
}

async function supabaseSignUp(email: string, password: string): Promise<Session> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json().catch(() => ({}))) as GoTrueTokenResponse;
  if (!res.ok) {
    throw new AuthError(errMessage(data, "Could not create your account."));
  }
  // If email confirmation is disabled, signup returns a full session.
  const session = tokenToSession(data);
  if (session) return session;
  // Otherwise, try an immediate sign-in (works when confirmation is off
  // but signup didn't echo a token). If that also fails, the project
  // requires email confirmation.
  try {
    return await supabaseSignIn(email, password);
  } catch {
    throw new AuthError(
      "Account created. Check your email to confirm it, then sign in."
    );
  }
}

// ── Local fallback (no Supabase configured) ──────────────────────────

interface LocalAccount {
  uid: string;
  email: string;
  passHash: string;
}

const LOCAL_ACCOUNTS_KEY = "apex:auth:accounts";

function readLocalAccounts(): Record<string, LocalAccount> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLocalAccounts(accounts: Record<string, LocalAccount>): void {
  window.localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function localSession(acc: LocalAccount): Session {
  return {
    user: { id: acc.uid, email: acc.email },
    accessToken: `local-${acc.uid}`,
    mode: "local",
  };
}

async function localSignUp(email: string, password: string): Promise<Session> {
  const key = email.toLowerCase();
  const accounts = readLocalAccounts();
  if (accounts[key]) {
    throw new AuthError("An account with that email already exists. Sign in.");
  }
  const acc: LocalAccount = {
    uid: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    passHash: await sha256(password),
  };
  accounts[key] = acc;
  writeLocalAccounts(accounts);
  return localSession(acc);
}

async function localSignIn(email: string, password: string): Promise<Session> {
  const key = email.toLowerCase();
  const acc = readLocalAccounts()[key];
  if (!acc || acc.passHash !== (await sha256(password))) {
    throw new AuthError("Invalid email or password.");
  }
  return localSession(acc);
}

// ── Public API ───────────────────────────────────────────────────────

function validate(email: string, password: string): void {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new AuthError("Enter a valid email address.");
  }
  if (password.length < 6) {
    throw new AuthError("Password must be at least 6 characters.");
  }
}

export async function signUp(email: string, password: string): Promise<Session> {
  email = email.trim();
  validate(email, password);
  return supabaseAuthConfigured()
    ? supabaseSignUp(email, password)
    : localSignUp(email, password);
}

export async function signIn(email: string, password: string): Promise<Session> {
  email = email.trim();
  validate(email, password);
  return supabaseAuthConfigured()
    ? supabaseSignIn(email, password)
    : localSignIn(email, password);
}
