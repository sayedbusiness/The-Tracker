import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // Org + project for source-map upload. Override via env if these differ.
  org: process.env.SENTRY_ORG || "sayed-sultani",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",

  // Only log Sentry build output in CI.
  silent: !process.env.CI,

  // Upload a wider set of client bundles for richer stack traces.
  widenClientFileUpload: true,

  // Tree-shake Sentry's debug logging to shrink the bundle.
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },

  // Route Sentry requests through a Next.js rewrite to dodge ad-blockers.
  tunnelRoute: "/monitoring",

  // Source maps are only uploaded when SENTRY_AUTH_TOKEN is set at build time;
  // without it the build still succeeds (upload is skipped).
});
