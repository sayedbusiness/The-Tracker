// Sentry — client-side initialization.
// This file runs in the browser. Next.js loads it automatically (it replaces
// the older sentry.client.config.ts convention).
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://df02f167625e73a802d5d25f4a7889c3@o4511528934637568.ingest.us.sentry.io/4511528942829568",

  // Sends request headers and IP address for users. See:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  integrations: [
    // Session Replay — records the user's session for replay on errors.
    Sentry.replayIntegration(),
  ],

  // Tracing — capture 100% of transactions.
  tracesSampleRate: 1.0,

  // Session Replay sample rates: 10% of all sessions, 100% of sessions with an error.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only print Sentry's own logs to the console in development.
  debug: false,
});

// Instruments App Router navigations so client-side route changes are traced.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
