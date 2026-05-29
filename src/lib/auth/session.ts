/**
 * Session persistence + per-user key namespacing.
 *
 * The session lives in localStorage. A non-HttpOnly `apex-uid` cookie
 * mirrors the user id so (a) the edge middleware can gate routes and
 * (b) `useSyncedState` can prefix every storage key with the user, so
 * two accounts on the same browser never see each other's data.
 *
 * Trust model: this is a personal-productivity app. The uid cookie is
 * not a hardened credential — for stronger isolation enable Supabase
 * Row Level Security on the state table. Good enough for v1, strictly
 * better than the previous single shared password.
 */
import type { Session } from "./types";

const SESSION_KEY = "apex:auth:session";
const UID_COOKIE = "apex-uid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s?.user?.id) return null;
    return s;
  } catch {
    return null;
  }
}

export function writeSession(session: Session): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* quota */
  }
  setUidCookie(session.user.id);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  // Expire the cookie.
  document.cookie = `${UID_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function setUidCookie(uid: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${UID_COOKIE}=${encodeURIComponent(
    uid
  )}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

/** Read the current uid from the cookie (client only). */
export function getUserId(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)apex-uid=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

/**
 * Storage-key prefix for the current user. Empty string when signed
 * out (preserves the original single-user data under un-prefixed keys).
 */
export function getUserPrefix(): string {
  const uid = getUserId();
  return uid ? `u:${uid}:` : "";
}
