// Sentry — server-side (Node.js runtime) initialization.
// Loaded via src/instrumentation.ts register() when NEXT_RUNTIME === "nodejs".
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://df02f167625e73a802d5d25f4a7889c3@o4511528934637568.ingest.us.sentry.io/4511528942829568",

  // Sends request headers and IP address for users.
  sendDefaultPii: true,

  // Tracing — capture 100% of transactions.
  tracesSampleRate: 1.0,

  debug: false,
});
