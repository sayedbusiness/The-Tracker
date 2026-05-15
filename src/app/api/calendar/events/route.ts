import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Fetch the next 24h of primary-calendar events. Returns 401 if not
 * connected. Auto-refreshes the access token if expired.
 */
export async function GET(req: NextRequest) {
  let accessToken = req.cookies.get("gcal-access")?.value;
  const refreshToken = req.cookies.get("gcal-refresh")?.value;

  if (!accessToken && !refreshToken) {
    return Response.json({ connected: false }, { status: 401 });
  }

  if (!accessToken && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (!refreshed.ok) {
      return Response.json(
        { connected: false, error: refreshed.error },
        { status: 401 }
      );
    }
    accessToken = refreshed.accessToken;
  }

  const now = new Date();
  const inOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const url = new URL(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events"
  );
  url.searchParams.set("timeMin", now.toISOString());
  url.searchParams.set("timeMax", inOneDay.toISOString());
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "30");

  let res = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  // 401 → access expired mid-flight; try refresh
  if (res.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (!refreshed.ok) {
      return Response.json({ connected: false }, { status: 401 });
    }
    accessToken = refreshed.accessToken;
    res = await fetch(url, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  }

  if (!res.ok) {
    const txt = await res.text();
    return Response.json(
      { connected: true, error: `Google API ${res.status}: ${txt.slice(0, 120)}` },
      { status: 500 }
    );
  }

  const data = (await res.json()) as {
    items?: Array<{
      id: string;
      summary?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
      location?: string;
      htmlLink?: string;
      colorId?: string;
    }>;
  };

  const events =
    data.items?.map((e) => ({
      id: e.id,
      title: e.summary ?? "Untitled",
      start: e.start?.dateTime ?? e.start?.date ?? null,
      end: e.end?.dateTime ?? e.end?.date ?? null,
      location: e.location ?? null,
      link: e.htmlLink ?? null,
      allDay: !e.start?.dateTime,
    })) ?? [];

  const out = Response.json({ connected: true, events });
  // Refresh the rolling access cookie if we re-fetched
  if (accessToken) {
    out.headers.append(
      "set-cookie",
      `gcal-access=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3000`
    );
  }
  return out;
}

async function refreshAccessToken(
  refreshToken: string
): Promise<
  { ok: true; accessToken: string } | { ok: false; error: string }
> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return { ok: false, error: "no-creds" };

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return { ok: false, error: await res.text() };
  const json = (await res.json()) as { access_token?: string };
  return json.access_token
    ? { ok: true, accessToken: json.access_token }
    : { ok: false, error: "no token" };
}
