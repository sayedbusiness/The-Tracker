import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "APEX OS — The Life Operating System",
  description:
    "A cinematic AI-powered personal operating system. Track, optimize, and dominate every area of your life.",
  applicationName: "APEX OS",
  appleWebApp: {
    capable: true,
    title: "APEX OS",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <head>
        {/* Sentry — error monitoring, tracing, and session replay.
            Loaded before hydration so it catches the earliest errors.
            The DSN is embedded in the loader script URL. */}
        <Script
          src="https://js.sentry-cdn.com/df02f167625e73a802d5d25f4a7889c3.min.js"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <Script id="sentry-onload" strategy="beforeInteractive">
          {`
            Sentry.onLoad(function () {
              Sentry.init({
                // Tracing — capture 100% of transactions.
                tracesSampleRate: 1.0,
                // Session Replay — 10% of all sessions, 100% of sessions with an error.
                replaysSessionSampleRate: 0.1,
                replaysOnErrorSampleRate: 1.0,
              });
            });
          `}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <div className="relative z-10 min-h-screen">{children}</div>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "glass-strong !rounded-2xl !border-white/10 !text-white",
            },
          }}
        />
      </body>
    </html>
  );
}
