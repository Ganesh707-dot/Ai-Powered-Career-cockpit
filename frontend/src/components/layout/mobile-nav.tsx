"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { brand, isMobileMoreRoute, mobileTabs, navGroups } from "@/lib/navigation";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfileStore } from "@/stores/profile-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string, role: string) {
  if (name.trim()) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return role.slice(0, 2).toUpperCase();
}

function MobileMenuGrid({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  const profile = useProfileStore();

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="px-4 pb-6 pt-1 space-y-6">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {initials(profile.displayName, profile.targetRole)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {profile.displayName || "Your workspace"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile.targetRole || "Set role via job mentor chat"}
            </p>
          </div>
        </div>

        {navGroups.map((group) => (
          <section key={group.label}>
            <h3 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex min-h-[72px] flex-col justify-between rounded-xl border p-3 transition-all duration-200 active:scale-[0.98]",
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-card/80 text-foreground hover:border-primary/25"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg",
                        isActive ? "bg-primary/20" : "bg-muted/60"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-medium leading-tight line-clamp-2">
                      {item.name}
                    </span>
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
      <SheetContent side="bottom" hideClose className="p-0 gap-0 bg-background">
        <SheetTitle className="sr-only">All tools</SheetTitle>
        <div className="flex items-center gap-3 border-b border-border/60 px-4 pb-3 pt-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70">
            <BrandIcon className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">All tools</p>
            <p className="text-xs text-muted-foreground">Jump to any workspace module</p>
          </div>
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
      <nav
        className="mobile-tab-bar lg:hidden"
        aria-label="Primary navigation"
      >
        <div className="mobile-tab-bar-inner">
          {mobileTabs.map((tab) => {
            const isActive = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "mobile-tab-item",
                  isActive && "mobile-tab-item-active"
                )}
              >
                <tab.icon className="h-5 w-5 shrink-0" aria-hidden />
                <span>{tab.name}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => onMenuOpenChange(true)}
            className={cn(
              "mobile-tab-item",
              (moreActive || menuOpen) && "mobile-tab-item-active"
            )}
            aria-label="Open all tools"
            aria-expanded={menuOpen}
          >
            <LayoutGrid className="h-5 w-5 shrink-0" aria-hidden />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
