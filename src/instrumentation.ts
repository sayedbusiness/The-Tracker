// Next.js instrumentation hook — runs once when the server boots.
// Picks the correct Sentry config for the active runtime.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Captures errors thrown while rendering React Server Components / route handlers.
export const onRequestError = Sentry.captureRequestError;
