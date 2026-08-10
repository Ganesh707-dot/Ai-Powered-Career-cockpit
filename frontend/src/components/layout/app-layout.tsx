"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./sidebar";
import { Header, MobileNav } from "./header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen app-mesh">
        <Sidebar />
        <div className="lg:pl-[260px] pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 p-4 sm:p-5 lg:p-8 page-enter">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </TooltipProvider>
  );
}
