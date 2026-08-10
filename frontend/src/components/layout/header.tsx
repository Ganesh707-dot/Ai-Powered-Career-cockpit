"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileSheetTrigger } from "./profile-sheet";
import { MobileNav } from "./mobile-nav";
import { useProfileStore } from "@/stores/profile-store";
import { pageTitles, pageDescriptions, brand } from "@/lib/navigation";

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "CareerPilot AI";
  const description = pageDescriptions[pathname];
  const profile = useProfileStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const BrandIcon = brand.icon;
  const isHome = pathname === "/";
  const hideMobileHeader = isHome || pathname === "/profile";

  return (
    <>
      {/* Mobile header — hidden on home (dedicated mobile dashboard has its own hero) */}
      {!hideMobileHeader && (
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-xl safe-top xl:hidden">
          <div className="flex h-12 items-center justify-between gap-3 px-4">
            <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5">
              <div className="mobile-brand-icon shrink-0">
                <BrandIcon className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight truncate">{title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{brand.name}</p>
              </div>
            </Link>
            <ProfileSheetTrigger />
          </div>
          {profile.isReady() && (
            <div className="border-t border-border/40 px-4 py-1.5">
              <p className="text-[10px] text-muted-foreground truncate">
                {profile.minSalaryLPA}–{profile.maxSalaryLPA} LPA · {profile.targetRole}
              </p>
            </div>
          )}
        </header>
      )}

      {/* Desktop header */}
      <header className="sticky top-0 z-30 hidden xl:block border-b border-border/60 bg-background/70 backdrop-blur-xl safe-top">
        <div className="flex h-[4.25rem] items-center justify-between gap-3 px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="min-w-0">
              <nav className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                <span>Workspace</span>
                <ChevronRight className="h-3 w-3 opacity-50" />
                <span className="text-foreground/80 truncate">{title}</span>
              </nav>
              <h2 className="text-lg font-semibold tracking-tight truncate leading-tight">
                {title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ProfileSheetTrigger />
            <Button asChild size="sm" className="rounded-lg shadow-sm shadow-primary/20">
              <Link href="/jobs?action=new">
                <Plus className="h-4 w-4" />
                Track
              </Link>
            </Button>
          </div>
        </div>

        {description && (
          <div className="border-t border-border/40 px-6 py-2">
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          </div>
        )}
      </header>

      <MobileNav menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
    </>
  );
}

export { MobileNav };
