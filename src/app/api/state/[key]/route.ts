import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Cross-device state sync via Vercel KV (Upstash REST API).
 *
 * Reads from process.env.KV_REST_API_URL + KV_REST_API_TOKEN — these
 * are populated automatically when you enable Vercel KV on the project
 * (Dashboard → Storage → Create Database → KV). No SDK needed; we hit
 * the Upstash REST endpoint directly so it works on the edge runtime.
 *
 * Until KV is enabled, this route returns 503 and the client falls back
 * to localStorage-only mode. Setup is 1 click in the Vercel dashboard.
 *
 * Key namespace: every key is prefixed with "apex:" on the client, so
 * collisions with other Vercel KV usage in the project are impossible.
 */

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days

function kvAvailable(): boolean {
  return Boolean(KV_URL && KV_TOKEN);
}

async function kvGet(key: string): Promise<{ value: unknown; updatedAt: number } | null> {
  const res = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { result: string | null };
  if (!body.result) return null;
  try {
    return JSON.parse(body.result) as { value: unknown; updatedAt: number };
  } catch {
    return null;
  }
}

async function kvSet(key: string, value: unknown, updatedAt: number) {
  const payload = JSON.stringify({ value, updatedAt });
  await fetch(`${KV_URL}/set/${encodeURIComponent(key)}?EX=${TTL_SECONDS}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    body: payload,
  });
}

async function kvDel(key: string) {
  await fetch(`${KV_URL}/del/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  if (!kvAvailable()) {
    return Response.json(
      { ok: false, kv: false, message: "KV not configured" },
      { status: 503 }
    );
  }
  const entry = await kvGet(`apex:${key}`);
  return Response.json({ ok: true, kv: true, entry }, { status: 200 });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  if (!kvAvailable()) {
    return Response.json(
      { ok: false, kv: false, message: "KV not configured" },
      { status: 503 }
    );
  }
  const body = (await req.json()) as { value: unknown; updatedAt?: number };
  const updatedAt = body.updatedAt ?? Date.now();
  await kvSet(`apex:${key}`, body.value, updatedAt);
  return Response.json({ ok: true, updatedAt }, { status: 200 });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  if (!kvAvailable()) {
    return Response.json(
      { ok: false, kv: false, message: "KV not configured" },
      { status: 503 }
    );
  }
  await kvDel(`apex:${key}`);
  return Response.json({ ok: true }, { status: 200 });
}
