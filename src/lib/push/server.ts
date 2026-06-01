/**
 * Server-side Web Push (Node runtime only — imported by /api/push/* and
 * /api/cron/*). Subscriptions are stored in the existing `apex_state`
 * table (reusing SUPABASE_SERVICE_ROLE_KEY) under a single row, so no new
 * table or env var is needed beyond the VAPID keys.
 *
 * Required env:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY   the VAPID public key
 *   VAPID_PRIVATE_KEY             the VAPID private key
 *   VAPID_SUBJECT (optional)      mailto: or https: contact (defaults set)
 *   NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY  (already set)
 */
import webpush from "web-push";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const SUBS_KEY = "push:subs";

export interface PushSub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface StoredSub {
  uid: string | null;
  sub: PushSub;
  ua?: string;
  createdAt: number;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export function storageConfigured(): boolean {
  return Boolean(SUPA_URL && SUPA_KEY);
}

export function vapidConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  );
}

/** Names of any missing pieces (never values) so the UI can show a checklist. */
export function pushMissing(): string[] {
  const m: string[] = [];
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) m.push("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
  if (!process.env.VAPID_PRIVATE_KEY) m.push("VAPID_PRIVATE_KEY");
  if (!SUPA_URL) m.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPA_KEY) m.push("SUPABASE_SERVICE_ROLE_KEY");
  return m;
}

let vapidReady = false;
function ensureVapid() {
  if (vapidReady) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT?.trim() || "mailto:notifications@avori.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!.trim(),
    process.env.VAPID_PRIVATE_KEY!.trim()
  );
  vapidReady = true;
}

function headers() {
  return {
    apikey: SUPA_KEY!,
    Authorization: `Bearer ${SUPA_KEY!}`,
    "Content-Type": "application/json",
  };
}

export async function loadSubs(): Promise<StoredSub[]> {
  if (!storageConfigured()) return [];
  const u = `${SUPA_URL}/rest/v1/apex_state?key=eq.${encodeURIComponent(
    SUBS_KEY
  )}&select=value`;
  const res = await fetch(u, { headers: headers(), cache: "no-store" });
  if (!res.ok) return [];
  const rows = (await res.json()) as Array<{ value: StoredSub[] }>;
  const list = rows[0]?.value;
  return Array.isArray(list) ? list : [];
}

async function writeSubs(list: StoredSub[]): Promise<void> {
  const u = `${SUPA_URL}/rest/v1/apex_state?on_conflict=key`;
  await fetch(u, {
    method: "POST",
    headers: { ...headers(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ key: SUBS_KEY, value: list, updated_at: Date.now() }),
  });
}

export async function addSub(entry: StoredSub): Promise<void> {
  const list = await loadSubs();
  const next = list.filter((s) => s.sub.endpoint !== entry.sub.endpoint);
  next.push(entry);
  await writeSubs(next);
}

export async function removeSub(endpoint: string): Promise<void> {
  const list = await loadSubs();
  await writeSubs(list.filter((s) => s.sub.endpoint !== endpoint));
}

/**
 * Send a payload to a set of subscriptions. Dead endpoints (404/410) are
 * pruned automatically so the store stays clean.
 */
export async function sendToSubs(
  subs: StoredSub[],
  payload: PushPayload
): Promise<{ sent: number; failed: number; pruned: number }> {
  if (!vapidConfigured() || subs.length === 0) {
    return { sent: 0, failed: 0, pruned: 0 };
  }
  ensureVapid();
  const body = JSON.stringify(payload);
  const dead: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(s.sub, body);
        sent++;
      } catch (err) {
        failed++;
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) dead.push(s.sub.endpoint);
      }
    })
  );

  if (dead.length) {
    const list = await loadSubs();
    await writeSubs(list.filter((s) => !dead.includes(s.sub.endpoint)));
  }
  return { sent, failed, pruned: dead.length };
}
