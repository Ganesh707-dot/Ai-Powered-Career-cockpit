"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ProfileSheetProvider } from "./profile-sheet";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileSheetProvider>
      <TooltipProvider delayDuration={300}>
        <div className="app-shell min-h-[100dvh] app-mesh">
          {/* Desktop sidebar only — never shown on mobile */}
          <Sidebar />
          <div className="w-full xl:pl-[260px]">
            <Header />
            <main className="mobile-page-main page-enter min-w-0">{children}</main>
          </div>
        </div>
      </TooltipProvider>
    </ProfileSheetProvider>
  );
}
