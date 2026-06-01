"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSyncedState } from "@/hooks/use-synced-state";
import { useAuth } from "@/lib/auth/use-auth";
import type { Profile } from "@/lib/auth/types";

/**
 * Per-account onboarding enforcement.
 *
 * Onboarding answers live in the per-user `profile` (synced), so they're
 * once-per-account, not per-device. Until `onboardingComplete` is true, a
 * signed-in user is bounced to /onboarding from any app page and can't
 * continue into the app. Signed-out users are handled by the auth gate.
 *
 * Renders nothing — it just guards navigation.
 */
export function OnboardingGate() {
  const pathname = usePathname();
  const { signedIn, hydrated } = useAuth();
  const [profile, , profileHydrated] = useSyncedState<Profile>("profile", {});

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydrated || !profileHydrated) return;
    // Only enforce for signed-in accounts (open/password modes have no account).
    if (!signedIn) return;
    if (pathname === "/onboarding") return;
    if (profile.onboardingComplete !== true) {
      window.location.assign("/onboarding");
    }
  }, [hydrated, profileHydrated, signedIn, profile.onboardingComplete, pathname]);

  return null;
}
