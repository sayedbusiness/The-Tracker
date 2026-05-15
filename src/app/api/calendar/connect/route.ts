import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Initiate Google OAuth for read-only Calendar access.
 * Requires GOOGLE_CLIENT_ID + GOOGLE_REDIRECT_URI env vars.
 * Redirect URI must be registered in Google Cloud Console for the project.
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    `${new URL(req.url).origin}/api/calendar/callback`;

  if (!clientId) {
    return Response.json(
      { error: "GOOGLE_CLIENT_ID not configured. See DEPLOY.md." },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const res = Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
  // CSRF cookie
  res.headers.append(
    "set-cookie",
    `gcal-state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  return res;
}
