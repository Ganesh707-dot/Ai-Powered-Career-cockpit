"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { brand, isMobileMoreRoute, mobileTabs, navGroups } from "@/lib/navigation";
import { MobileTabIcon } from "@/components/mobile/mobile-tab-icon";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfileStore } from "@/stores/profile-store";
import { useProfileSheet } from "@/components/layout/profile-sheet";

const TILE_GRADIENTS = [
  "from-violet-500/20 via-violet-500/5 to-transparent",
  "from-sky-500/20 via-sky-500/5 to-transparent",
  "from-amber-500/20 via-amber-500/5 to-transparent",
  "from-emerald-500/20 via-emerald-500/5 to-transparent",
  "from-rose-500/20 via-rose-500/5 to-transparent",
  "from-cyan-500/20 via-cyan-500/5 to-transparent",
];

function MobileMenuGrid({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  const profile = useProfileStore();
  const { openProfile } = useProfileSheet();
  let tileIndex = 0;

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="px-4 pb-8 pt-2 space-y-5">
        <button
          type="button"
          onClick={() => {
            onNavigate();
            openProfile();
          }}
          className="mobile-menu-profile w-full text-left"
        >
          <div className="flex items-center gap-3">
            <div className="mobile-menu-profile-icon">
              {(profile.displayName || profile.targetRole).slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">
                {profile.displayName || "Your workspace"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.targetRole || "Tap to edit profile & prefs"}
              </p>
            </div>
          </div>
        </button>

        {navGroups.map((group) => (
          <section key={group.label}>
            <h3 className="mb-2.5 px-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {group.label}
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                const gradient = TILE_GRADIENTS[tileIndex++ % TILE_GRADIENTS.length];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "mobile-menu-tile bg-gradient-to-br",
                      gradient,
                      isActive && "mobile-menu-tile-active"
                    )}
                    style={{ animationDelay: `${tileIndex * 40}ms` }}
                  >
                    <span className="mobile-menu-tile-icon">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium leading-tight">{item.name}</span>
                    {item.description && (
                      <span className="text-[10px] text-muted-foreground line-clamp-1">
                        {item.description}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </ScrollArea>
  );
}

export function MobileMenuSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const BrandIcon = brand.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        hideClose
        className="mobile-menu-sheet p-0 gap-0 bg-background border-t-0"
      >
        <SheetTitle className="sr-only">All tools</SheetTitle>
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="mobile-brand-icon">
              <BrandIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold">Workspace</p>
              <p className="text-xs text-muted-foreground">All career tools</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mobile-icon-btn shrink-0"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <MobileMenuGrid pathname={pathname} onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function MobileNav({
  menuOpen,
  onMenuOpenChange,
}: {
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const moreActive = isMobileMoreRoute(pathname);

  return (
    <>
      <MobileMenuSheet open={menuOpen} onOpenChange={onMenuOpenChange} />
      <nav className="mobile-tab-bar" aria-label="Primary navigation">
        <div className="mobile-tab-bar-inner">
          {mobileTabs.map((tab) => {
            const isActive = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn("mobile-tab-link", isActive && "mobile-tab-link-active")}
              >
                <MobileTabIcon icon={tab.icon} active={isActive} label={tab.name} />
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => onMenuOpenChange(true)}
            className={cn(
              "mobile-tab-link",
              (moreActive || menuOpen) && "mobile-tab-link-active"
            )}
            aria-label="Open all tools"
            aria-expanded={menuOpen}
          >
            <MobileTabIcon icon={LayoutGrid} active={moreActive || menuOpen} label="More" />
          </button>
        </div>
      </nav>
    </>
  );
}
