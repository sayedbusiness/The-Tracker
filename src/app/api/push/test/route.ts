import type { NextRequest } from "next/server";
import {
  loadSubs,
  sendToSubs,
  vapidConfigured,
  pushMissing,
} from "@/lib/push/server";

export const runtime = "nodejs";

function uidFromReq(req: NextRequest): string | null {
  return req.cookies.get("apex-uid")?.value || null;
}

/** POST — fire a test push to this account's devices (proves it works). */
export async function POST(req: NextRequest) {
  if (!vapidConfigured()) {
    return Response.json(
      { ok: false, error: "Push not configured", missing: pushMissing() },
      { status: 503 }
    );
  }
  const uid = uidFromReq(req);
  const all = await loadSubs();
  const mine = uid ? all.filter((s) => s.uid === uid) : all;
  // Fall back to all devices if this account has none registered yet.
  const targets = mine.length > 0 ? mine : all;

  if (targets.length === 0) {
    return Response.json(
      { ok: false, error: "No subscribed devices. Enable notifications first." },
      { status: 400 }
    );
  }

  const result = await sendToSubs(targets, {
    title: "Avori OS ✅",
    body: "Push is live. You'll get nudges even when the app is closed.",
    url: "/",
    tag: "avori-test",
  });

  return Response.json({ ok: true, sent: result.sent, failed: result.failed });
}
