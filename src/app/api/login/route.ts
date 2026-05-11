import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * POST /api/login
 * Body: { password: string }
 *
 * Verifies against APEX_PASSWORD env var (server-only). On success,
 * sets an HttpOnly `apex-auth` cookie containing sha256(password)
 * with a 30-day expiry. On failure, returns 401 after a small delay
 * (rate-limit friction).
 */
export async function POST(req: NextRequest) {
  const expected = process.env.APEX_PASSWORD;
  if (!expected) {
    return Response.json(
      {
        error:
          "Auth not configured. Add APEX_PASSWORD to Vercel env vars to lock the site.",
      },
      { status: 500 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const submitted = body.password?.trim() ?? "";
  // Constant-time-ish compare via fixed-length check
  const ok =
    submitted.length === expected.length &&
    (await sha256(submitted)) === (await sha256(expected));

  if (!ok) {
    // Brief delay to slow brute-force
    await new Promise((r) => setTimeout(r, 600));
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }

  const hash = await sha256(expected);
  const res = Response.json({ ok: true });
  res.headers.append(
    "set-cookie",
    [
      `apex-auth=${hash}`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      `Max-Age=${60 * 60 * 24 * 30}`, // 30 days
    ].join("; ")
  );
  return res;
}

/**
 * POST /api/login/logout — clear cookie
 */
export async function DELETE() {
  const res = Response.json({ ok: true });
  res.headers.append(
    "set-cookie",
    "apex-auth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
  );
  return res;
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
