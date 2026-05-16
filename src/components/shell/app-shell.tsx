"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";
import { AiHelperFab } from "./ai-helper-fab";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);
  return (
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
    </div>
  );
}
