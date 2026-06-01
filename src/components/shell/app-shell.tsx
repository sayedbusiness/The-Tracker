"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";
import { AiHelperFab } from "./ai-helper-fab";
import { DopamineProvider } from "@/components/dopamine/dopamine-provider";
import { PendingProvider } from "@/components/notifications/pending-provider";
import { DailyReward } from "@/components/dopamine/daily-reward";
import { StepTrackingProvider } from "@/components/health/step-tracking-provider";
import { OnboardingGate } from "@/components/auth/onboarding-gate";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);
  return (
    <DopamineProvider>
      <StepTrackingProvider>
      <PendingProvider>
      <OnboardingGate />
      <div className="flex min-h-screen">
        <Sidebar onOpenCommand={() => setCmdOpen(true)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenCommand={() => setCmdOpen(true)} />
          <main
            className="flex-1 px-4 pt-6 lg:px-8 lg:pb-12"
            style={{
              paddingBottom:
                "calc(env(safe-area-inset-bottom) + 6rem)",
            }}
          >
            {children}
          </main>
        </div>
        <MobileNav />
        <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
        <AiHelperFab />
        <DailyReward />
      </div>
      </PendingProvider>
      </StepTrackingProvider>
    </DopamineProvider>
  );
}
