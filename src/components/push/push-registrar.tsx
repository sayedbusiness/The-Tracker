"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/push/client";

/**
 * Registers the service worker on app load so push notifications can be
 * delivered even when the app is later closed. Mounted once in the shell.
 */
export function PushRegistrar() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);
  return null;
}
