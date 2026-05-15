import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Debug helper: shows whether each Google Calendar env var is present
 * on this deployment. Never prints actual secret values — only length
 * + first/last few characters so you can spot copy-paste truncation.
 */
export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const ci = process.env.GOOGLE_CLIENT_ID;
  const cs = process.env.GOOGLE_CLIENT_SECRET;
  const ru = process.env.GOOGLE_REDIRECT_URI;

  return Response.json(
    {
      origin,
      expected_redirect_uri: `${origin}/api/calendar/callback`,
      env: {
        GOOGLE_CLIENT_ID: maskValue(ci),
        GOOGLE_CLIENT_SECRET: maskValue(cs),
        GOOGLE_REDIRECT_URI: ru ?? "(unset — will default to origin)",
      },
      checks: {
        client_id_present: Boolean(ci?.trim()),
        client_id_looks_valid: Boolean(
          ci?.trim().endsWith(".apps.googleusercontent.com")
        ),
        client_secret_present: Boolean(cs?.trim()),
        redirect_uri_matches_origin:
          !ru ||
          ru.trim() === `${origin}/api/calendar/callback`,
      },
      next_step:
        !ci || !cs
          ? "Set the missing vars in Vercel → Settings → Environment Variables, then REDEPLOY (Deployments tab → ⋯ → Redeploy)."
          : "Env vars look present. Try /api/calendar/connect.",
    },
    { status: 200 }
  );
}

function maskValue(v: string | undefined): string {
  if (!v) return "(unset)";
  const t = v.trim();
  if (t.length === 0) return "(empty string)";
  if (t.length <= 8) return `${t.length} chars: ${t.slice(0, 2)}…${t.slice(-2)}`;
  return `${t.length} chars: ${t.slice(0, 6)}…${t.slice(-6)}`;
}
