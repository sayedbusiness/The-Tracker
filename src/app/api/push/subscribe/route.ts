import type { NextRequest } from "next/server";
import { addSub, removeSub, storageConfigured, type PushSub } from "@/lib/push/server";

export const runtime = "nodejs";

function uidFromReq(req: NextRequest): string | null {
  return req.cookies.get("apex-uid")?.value || null;
}

/** POST { subscription } — store this device's push subscription. */
export async function POST(req: NextRequest) {
  if (!storageConfigured()) {
    return Response.json(
      { ok: false, error: "Push storage not configured" },
      { status: 503 }
    );
  }
  const body = (await req.json().catch(() => ({}))) as { subscription?: PushSub };
  if (!body.subscription?.endpoint || !body.subscription.keys) {
    return Response.json({ ok: false, error: "Missing subscription" }, { status: 400 });
  }
  await addSub({
    uid: uidFromReq(req),
    sub: body.subscription,
    ua: req.headers.get("user-agent") ?? undefined,
    createdAt: Date.now(),
  });
  return Response.json({ ok: true });
}

/** DELETE { endpoint } — remove a subscription (on sign-out / opt-out). */
export async function DELETE(req: NextRequest) {
  if (!storageConfigured()) {
    return Response.json({ ok: false, error: "Not configured" }, { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as { endpoint?: string };
  if (!body.endpoint) {
    return Response.json({ ok: false, error: "Missing endpoint" }, { status: 400 });
  }
  await removeSub(body.endpoint);
  return Response.json({ ok: true });
}
