import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * OAuth callback — exchanges code for tokens, stores them in HttpOnly
 * cookies (access + refresh), then redirects back to /calendar.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stateCookie = req.cookies.get("gcal-state")?.value;

  if (!code) return errorRedirect(req, "Missing authorization code");
  if (!state || !stateCookie || state !== stateCookie) {
    return errorRedirect(req, "OAuth state mismatch");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    `${url.origin}/api/calendar/callback`;

  if (!clientId || !clientSecret) {
    return errorRedirect(req, "Google credentials missing on server");
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
    return errorRedirect(req, `Token exchange failed: ${body.slice(0, 120)}`);
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  const res = Response.redirect(`${url.origin}/calendar`);
  res.headers.append(
    "set-cookie",
    `gcal-access=${tokens.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${tokens.expires_in}`
  );
  if (tokens.refresh_token) {
    res.headers.append(
      "set-cookie",
      `gcal-refresh=${tokens.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 90}`
    );
  }
  // Clear CSRF cookie
  res.headers.append(
    "set-cookie",
    "gcal-state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
  );
  return res;
}

function errorRedirect(req: NextRequest, msg: string) {
  const url = new URL("/calendar", req.url);
  url.searchParams.set("error", msg);
  return Response.redirect(url);
}
