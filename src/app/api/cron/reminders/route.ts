import type { NextRequest } from "next/server";
import {
  loadSubs,
  sendToSubs,
  vapidConfigured,
  pushMissing,
  type PushPayload,
} from "@/lib/push/server";

export const runtime = "nodejs";

/**
 * Scheduled reminder push — this is what nudges you when the app is fully
 * closed. Triggered by Vercel Cron (see vercel.json). The message adapts to
 * the time of day in Pacific time, so adding more cron schedules (Pro plan)
 * gives morning / midday / evening nudges automatically.
 *
 * Auth: Vercel sends `Authorization: Bearer <CRON_SECRET>` when the
 * CRON_SECRET env var is set. Manual runs can pass ?secret=<CRON_SECRET>.
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true; // no secret set → allow (still VAPID-gated)
  const header = req.headers.get("authorization");
  const bearer = header?.replace(/^Bearer\s+/i, "");
  const query = new URL(req.url).searchParams.get("secret");
  return bearer === secret || query === secret;
}

function ptHour(): number {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    hour12: false,
  }).format(new Date());
  const h = parseInt(s, 10);
  return Number.isFinite(h) ? h % 24 : 12;
}

function reminderFor(hour: number): PushPayload {
  if (hour >= 4 && hour < 11) {
    return {
      title: "🌅 New day — lock in",
      body: "Open Avori and start your first cold-call block. Owners answer in the morning.",
      url: "/plan",
      tag: "avori-morning",
    };
  }
  if (hour >= 11 && hour < 16) {
    return {
      title: "⚡ Midday check",
      body: "How many dials so far? Don't let the afternoon slip — knock out the next block.",
      url: "/",
      tag: "avori-midday",
    };
  }
  if (hour >= 16 && hour < 22) {
    return {
      title: "🌙 Close strong",
      body: "Check off your day plan before midnight or the streak resets. Finish what you started.",
      url: "/plan",
      tag: "avori-evening",
    };
  }
  return {
    title: "Avori OS",
    body: "Tomorrow won't catch up to you. Rest up — big day ahead.",
    url: "/",
    tag: "avori-night",
  };
}

async function run(req: NextRequest) {
  if (!authorized(req)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!vapidConfigured()) {
    return Response.json(
      { ok: false, error: "Push not configured", missing: pushMissing() },
      { status: 503 }
    );
  }
  const subs = await loadSubs();
  const payload = reminderFor(ptHour());
  const result = await sendToSubs(subs, payload);
  return Response.json({
    ok: true,
    devices: subs.length,
    sent: result.sent,
    pruned: result.pruned,
  });
}

export async function GET(req: NextRequest) {
  return run(req);
}

// Allow manual POST triggering too (e.g. from an external scheduler).
export async function POST(req: NextRequest) {
  return run(req);
}
