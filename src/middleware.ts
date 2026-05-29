import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route gate with three modes, auto-selected from env:
 *
 *  1. supabase — NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY set.
 *     Real multi-user accounts. Requires the `apex-uid` cookie (set by the
 *     client after Supabase sign-in). No cookie → redirect to /login.
 *
 *  2. password — only APEX_PASSWORD set. Legacy single shared password.
 *     Requires the `apex-auth` cookie (sha256 of the password) set by
 *     /api/login. No/!match → redirect to /login.
 *
 *  3. open — nothing set. No gate (local/dev). The app still runs and the
 *     login/register pages work against local accounts.
 */
export async function middleware(req: NextRequest) {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
  const password = process.env.APEX_PASSWORD;
  const path = req.nextUrl.pathname;

  // Always-allowed paths (auth screens, all APIs, static assets, manifest).
  if (
    path === "/login" ||
    path === "/register" ||
    path.startsWith("/api/") ||
    path === "/manifest.webmanifest" ||
    path === "/icon.svg" ||
    path === "/apple-icon" ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  if (supabaseConfigured) {
    const uid = req.cookies.get("apex-uid")?.value;
    if (uid) return NextResponse.next();
    return redirectToLogin(req, path);
  }

  if (password) {
    const cookie = req.cookies.get("apex-auth")?.value;
    const expected = await sha256(password);
    if (cookie && cookie === expected) return NextResponse.next();
    return redirectToLogin(req, path);
  }

  // Open mode — no gate.
  return NextResponse.next();
}

function redirectToLogin(req: NextRequest, path: string) {
  const loginUrl = new URL("/login", req.url);
  if (path !== "/") loginUrl.searchParams.set("next", path);
  return NextResponse.redirect(loginUrl);
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const config = {
  matcher: [
    // Run on everything except Next internals + static asset files
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
