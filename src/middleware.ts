import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Password gate. APEX_PASSWORD env var on the server controls access.
 *
 * - If APEX_PASSWORD is unset → open mode (dev / local). Useful when
 *   running locally without setting up auth.
 * - If APEX_PASSWORD is set → cookie `apex-auth` must contain its
 *   sha256(password) hash to reach any page. Otherwise redirect to /login.
 *
 * The hash never leaves the server. The browser only ever sees the
 * opaque digest in an HttpOnly cookie set by /api/login.
 */
export async function middleware(req: NextRequest) {
  const password = process.env.APEX_PASSWORD;
  // Dev / unconfigured: no gate
  if (!password) return NextResponse.next();

  const path = req.nextUrl.pathname;

  // Always allow login page, login API, manifest, icons, static assets
  if (
    path === "/login" ||
    path.startsWith("/api/login") ||
    path === "/manifest.webmanifest" ||
    path === "/icon.svg" ||
    path === "/apple-icon" ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("apex-auth")?.value;
  const expected = await sha256(password);

  if (cookie && cookie === expected) {
    return NextResponse.next();
  }

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
