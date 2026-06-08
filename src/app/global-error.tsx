"use client";

// Catches errors that crash the root layout itself. When this renders, the
// normal layout (and its CSS) is bypassed, so styles are inlined.
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#050507",
          color: "#e2e8f0",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ maxWidth: 420, padding: 32, textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Something broke
          </div>
          <h1 style={{ margin: "12px 0", fontSize: 24, fontWeight: 700, color: "#fff" }}>
            We hit an unexpected error.
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#94a3b8" }}>
            It&apos;s been logged automatically. Try again — if it keeps
            happening, it&apos;ll show up in our error tracker.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 6px 20px rgba(99,102,241,0.4)",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
