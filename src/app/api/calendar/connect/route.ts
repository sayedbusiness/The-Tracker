import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Initiate Google OAuth for read-only Calendar access.
 * Requires GOOGLE_CLIENT_ID + GOOGLE_REDIRECT_URI env vars.
 * Redirect URI must be registered in Google Cloud Console for the project.
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const origin = new URL(req.url).origin;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    `${origin}/api/calendar/callback`;

  // Hard-block with a clear message if anything is missing or malformed.
  const issues: string[] = [];
  if (!clientId) issues.push("GOOGLE_CLIENT_ID is empty or unset");
  else if (!clientId.endsWith(".apps.googleusercontent.com"))
    issues.push(
      `GOOGLE_CLIENT_ID looks wrong (must end in .apps.googleusercontent.com — yours ends in "${clientId.slice(-30)}")`
    );
  if (!clientSecret) issues.push("GOOGLE_CLIENT_SECRET is empty or unset");

  if (issues.length > 0) {
    return new Response(
      renderErrorPage({
        title: "Google Calendar not configured",
        issues,
        origin,
        redirectUri,
      }),
      {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      }
    );
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  // Build the redirect manually — Response.redirect() returns a response
  // with immutable headers on the edge runtime, so we can't attach the
  // state cookie to it. This works.
  return new Response(null, {
    status: 302,
    headers: {
      location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      "set-cookie": `gcal-state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

function renderErrorPage({
  title,
  issues,
  origin,
  redirectUri,
}: {
  title: string;
  issues: string[];
  origin: string;
  redirectUri: string;
}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title} · APEX OS</title>
  <style>
    :root { color-scheme: dark; }
    body { background: #000; color: #e8ecf5; font-family: -apple-system, system-ui, sans-serif; margin: 0; padding: 40px 20px; line-height: 1.5; }
    .wrap { max-width: 640px; margin: 0 auto; }
    h1 { font-size: 24px; margin: 0 0 6px; background: linear-gradient(135deg,#fff,#9ca6c5); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    .sub { color: #9ca6c5; font-size: 14px; margin-bottom: 24px; }
    .card { background: linear-gradient(180deg,#0a0f1c,#050709); border: 1px solid rgba(59,130,246,0.15); border-radius: 16px; padding: 20px; margin-bottom: 16px; }
    .label { color: #60a5fa; font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 8px; }
    code { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 6px; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; color: #93c5fd; word-break: break-all; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; color: #cbd2e6; font-size: 14px; }
    li b { color: #fca5a5; font-weight: 600; }
    .steps { color: #cbd2e6; font-size: 14px; }
    .steps ol { padding-left: 22px; }
    .steps li { margin-bottom: 10px; }
    a { color: #60a5fa; text-decoration: none; }
    a:hover { color: #93c5fd; text-decoration: underline; }
    .back { display: inline-block; margin-top: 20px; padding: 10px 18px; background: linear-gradient(135deg,#1e3a8a,#3b82f6); color: white; border-radius: 12px; font-size: 14px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>⚠ Google Calendar not configured</h1>
    <div class="sub">Your Vercel env vars aren't reaching this endpoint. Fix the issues below, then redeploy.</div>

    <div class="card">
      <div class="label">What's wrong</div>
      <ul>${issues.map((i) => `<li>• <b>${escapeHtml(i)}</b></li>`).join("")}</ul>
    </div>

    <div class="card">
      <div class="label">Required env vars (copy these exact names)</div>
      <ul>
        <li><code>GOOGLE_CLIENT_ID</code> — ends in <code>.apps.googleusercontent.com</code></li>
        <li><code>GOOGLE_CLIENT_SECRET</code> — starts with <code>GOCSPX-</code></li>
        <li><code>GOOGLE_REDIRECT_URI</code> — must be <code>${escapeHtml(origin)}/api/calendar/callback</code></li>
      </ul>
    </div>

    <div class="card steps">
      <div class="label">How to fix</div>
      <ol>
        <li>Go to <a href="https://vercel.com/dashboard" target="_blank">vercel.com/dashboard</a> → your project → <b>Settings</b> → <b>Environment Variables</b></li>
        <li>Check that the names are EXACTLY: <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>, <code>GOOGLE_REDIRECT_URI</code>. Case-sensitive, no extra spaces or quotes.</li>
        <li>Check that all three are set for the <b>Production</b> environment (and Preview).</li>
        <li>Go to the <b>Deployments</b> tab → click <b>⋯</b> on the most recent deploy → <b>Redeploy</b>. Vercel does NOT auto-rebuild when you add env vars to an existing deploy — you have to manually redeploy.</li>
        <li>Wait for the green checkmark (~90s), then try connecting again.</li>
      </ol>
    </div>

    <div class="card">
      <div class="label">Sanity check</div>
      <ul>
        <li>This endpoint sees the redirect URI as: <code>${escapeHtml(redirectUri)}</code></li>
        <li>Make sure this exact URL is also registered in Google Cloud Console → Credentials → your OAuth client → Authorized redirect URIs.</li>
      </ul>
    </div>

    <a href="/calendar" class="back">← Back to Calendar</a>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
