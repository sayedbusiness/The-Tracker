import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "APEX OS — The Life Operating System",
    short_name: "APEX OS",
    description:
      "A cinematic AI-powered personal operating system. Track, optimize, and dominate every area of your life.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050507",
    theme_color: "#050507",
    categories: ["productivity", "lifestyle", "health", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "AI Coach",
        short_name: "Coach",
        url: "/assistant",
        description: "Open the AI coach chat",
      },
      {
        name: "Today's Tasks",
        short_name: "Tasks",
        url: "/tasks",
        description: "Jump to today's task list",
      },
      {
        name: "Agency",
        short_name: "Agency",
        url: "/agency",
        description: "Open the Apex Growth Corp command center",
      },
      {
        name: "Health",
        short_name: "Health",
        url: "/health",
        description: "Log a meal or workout",
      },
    ],
  };
}
