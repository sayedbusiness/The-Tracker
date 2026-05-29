/**
 * Supabase client-side configuration.
 *
 * These are NEXT_PUBLIC_* vars so they're inlined into the client bundle
 * at build time. When both are present, the app runs in real multi-user
 * "supabase auth" mode. When absent, auth falls back to local accounts
 * (localStorage) so the login / register / onboarding flow is still fully
 * usable for development and demos.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

/** True when Supabase Auth is wired (URL + anon key present). */
export function supabaseAuthConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
