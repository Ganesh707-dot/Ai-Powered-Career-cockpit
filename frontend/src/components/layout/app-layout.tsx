"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ProfileSheetProvider } from "./profile-sheet";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileSheetProvider>
      <TooltipProvider delayDuration={300}>
        <div className="min-h-[100dvh] min-h-[100vh] app-mesh flex flex-col">
          {/* Desktop sidebar only — never shown on mobile */}
          <Sidebar />
          <div className="w-full lg:pl-[260px] flex flex-1 flex-col min-h-0 mobile-content-offset">
            <Header />
            <main className="flex-1 mobile-page-main page-enter min-w-0 overflow-x-hidden overflow-y-auto touch-scroll overscroll-y-contain">
              {children}
            </main>
          </div>
        </div>
      </TooltipProvider>
    </ProfileSheetProvider>
  );
}
