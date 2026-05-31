export const runtime = "edge";

/**
 * GET /api/auth/mode
 *
 * Tells the login screen which auth mode the server is configured for:
 *   - "supabase" → real multi-user accounts (Supabase Auth)
 *   - "password" → single shared password (AVORI_PASSWORD / APEX_PASSWORD)
 *   - "open"     → no gate; local accounts available for demo
 */
export function GET() {
  const supabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
  const password = Boolean(
    process.env.AVORI_PASSWORD ?? process.env.APEX_PASSWORD
  );
  const mode = supabase ? "supabase" : password ? "password" : "open";
  return Response.json({ mode });
}
