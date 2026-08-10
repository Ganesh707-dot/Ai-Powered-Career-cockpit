"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./sidebar";
import { Header, MobileNav } from "./header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-[100dvh] min-h-[100vh] app-mesh flex flex-col">
        <Sidebar />
        <div className="lg:pl-[260px] flex flex-1 flex-col min-h-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
          <Header />
          <main className="flex-1 p-3 sm:p-5 lg:p-8 page-enter min-w-0 overflow-x-hidden">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </TooltipProvider>
  );
}
