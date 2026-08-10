"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileSheet } from "./profile-sheet";
import { MobileNav, MobileSidebar } from "./mobile-nav";
import { useProfileStore } from "@/stores/profile-store";
import { pageTitles, pageDescriptions } from "@/lib/navigation";

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "CareerPilot AI";
  const description = pageDescriptions[pathname];
  const profile = useProfileStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl safe-top">
        <div className="flex h-14 lg:h-[4.25rem] items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden h-9 w-9 rounded-lg"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0 hidden sm:block">
              <nav className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                <span>Workspace</span>
                <ChevronRight className="h-3 w-3 opacity-50" />
                <span className="text-foreground/80 truncate">{title}</span>
              </nav>
              <h2 className="text-base lg:text-lg font-semibold tracking-tight truncate leading-tight">
                {title}
              </h2>
            </div>
            <div className="min-w-0 sm:hidden">
              <h2 className="text-base font-semibold tracking-tight truncate">{title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ProfileSheet />
            <Button asChild size="sm" className="rounded-lg shadow-sm shadow-primary/20">
              <Link href="/jobs?action=new">
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Track</span>
              </Link>
            </Button>
          </div>
        </div>

        {description && (
          <div className="hidden lg:block border-t border-border/40 px-6 py-2">
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          </div>
        )}

        {profile.isReady() && (
          <div className="hidden md:block lg:hidden border-t border-border/40 px-4 py-1.5">
            <p className="text-[10px] text-muted-foreground truncate">
              {profile.minSalaryLPA}–{profile.maxSalaryLPA} LPA · {profile.targetRole}
            </p>
          </div>
        )}
      </header>
    </>
  );
}

export { MobileNav };
