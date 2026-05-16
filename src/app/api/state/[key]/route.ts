import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Cross-device state sync via Supabase (free tier — 500 MB Postgres
 * + 2 GB egress is plenty for a single user).
 *
 * Reads from NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Hits the PostgREST endpoint directly so no SDK is needed — works
 * on the edge runtime.
 *
 * One-time setup (see DEPLOY.md):
 *   1. Create a table `apex_state(key text primary key,
 *      value jsonb not null, updated_at bigint not null)`.
 *   2. Add the two env vars in Vercel.
 *
 * Until those are set, this route returns 503 and the client falls
 * back to localStorage-only mode.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

function configured(): boolean {
  return Boolean(URL && KEY);
}

function authHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: KEY!,
    Authorization: `Bearer ${KEY!}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function getRow(
  key: string
): Promise<{ value: unknown; updatedAt: number } | null> {
  const u = `${URL}/rest/v1/apex_state?key=eq.${encodeURIComponent(key)}&select=value,updated_at`;
  const res = await fetch(u, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<{
    value: unknown;
    updated_at: number;
  }>;
  if (!rows[0]) return null;
  return { value: rows[0].value, updatedAt: Number(rows[0].updated_at) };
}

async function upsertRow(key: string, value: unknown, updatedAt: number) {
  // Upsert via PostgREST: POST with Prefer: resolution=merge-duplicates
  // and on_conflict=key so existing rows get the new value+timestamp.
  const u = `${URL}/rest/v1/apex_state?on_conflict=key`;
  await fetch(u, {
    method: "POST",
    headers: authHeaders({
      Prefer: "resolution=merge-duplicates,return=minimal",
    }),
    body: JSON.stringify({ key, value, updated_at: updatedAt }),
  });
}

async function deleteRow(key: string) {
  const u = `${URL}/rest/v1/apex_state?key=eq.${encodeURIComponent(key)}`;
  await fetch(u, { method: "DELETE", headers: authHeaders() });
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ key: string }> }
) {
  const { key } = await ctx.params;
  if (!configured()) {
    return Response.json(
      { ok: false, configured: false, message: "Supabase not configured" },
      { status: 503 }
    );
  }
  const entry = await getRow(`apex:${key}`);
  return Response.json({ ok: true, configured: true, entry }, { status: 200 });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ key: string }> }
) {
  const { key } = await ctx.params;
  if (!configured()) {
    return Response.json(
      { ok: false, configured: false, message: "Supabase not configured" },
      { status: 503 }
    );
  }
  const body = (await req.json()) as { value: unknown; updatedAt?: number };
  const updatedAt = body.updatedAt ?? Date.now();
  await upsertRow(`apex:${key}`, body.value, updatedAt);
  return Response.json({ ok: true, updatedAt }, { status: 200 });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ key: string }> }
) {
  const { key } = await ctx.params;
  if (!configured()) {
    return Response.json(
      { ok: false, configured: false, message: "Supabase not configured" },
      { status: 503 }
    );
  }
  await deleteRow(`apex:${key}`);
  return Response.json({ ok: true }, { status: 200 });
}
