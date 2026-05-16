import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * OAuth callback — exchanges code for tokens, stores them in HttpOnly
 * cookies (access + refresh), then redirects back to /calendar.
 *
 * IMPORTANT: We construct the 302 manually instead of using
 * Response.redirect() because the latter returns immutable headers in
 * the edge runtime, which throws when we try to append Set-Cookie.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stateCookie = req.cookies.get("gcal-state")?.value;

  if (!code) return errorRedirect(url.origin, "Missing authorization code");
  if (!state || !stateCookie || state !== stateCookie) {
    return errorRedirect(url.origin, "OAuth state mismatch");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    `${url.origin}/api/calendar/callback`;

  if (!clientId || !clientSecret) {
    return errorRedirect(url.origin, "Google credentials missing on server");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    return errorRedirect(
      url.origin,
      `Token exchange failed: ${body.slice(0, 120)}`
    );
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  const cookies: string[] = [
    `gcal-access=${tokens.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${tokens.expires_in}`,
    "gcal-state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
  ];
  if (tokens.refresh_token) {
    cookies.push(
      `gcal-refresh=${tokens.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 90}`
    );
  }

  const headers = new Headers();
  headers.set("location", `${url.origin}/calendar`);
  for (const c of cookies) headers.append("set-cookie", c);

  return new Response(null, { status: 302, headers });
}

function errorRedirect(origin: string, msg: string) {
  const dest = new URL("/calendar", origin);
  dest.searchParams.set("error", msg);
  return new Response(null, {
    status: 302,
    headers: { location: dest.toString() },
  });
}
