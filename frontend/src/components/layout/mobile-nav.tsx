"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigation, brand, navGroups } from "@/lib/navigation";
import { NavLink } from "./nav-link";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-4 left-4 right-4 z-50 lg:hidden safe-bottom"
      aria-label="Primary navigation"
    >
      <div className="mobile-dock-blur mx-auto flex max-w-md items-stretch justify-around rounded-2xl border border-border/60 px-1 py-1.5 shadow-2xl shadow-black/40">
        {navigation
          .filter((item) => item.mobilePrimary)
          .map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition-all duration-300",
                  isActive ? "text-primary" : "text-muted-foreground active:scale-95"
                )}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-primary/10" />
                )}
                <item.icon
                  className={cn(
                    "relative h-5 w-5 transition-transform duration-300",
                    isActive && "scale-110"
                  )}
                />
                <span className="relative truncate max-w-full">
                  {item.name.split(" ")[0]}
                </span>
              </Link>
            );
          })}
      </div>
    </nav>
  );
}

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const BrandIcon = brand.icon;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" className="p-0 gap-0">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70">
            <BrandIcon className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold">{brand.name}</p>
            <p className="text-[10px] text-muted-foreground">{brand.tagline}</p>
          </div>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink key={item.href} item={item} onClick={onClose} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
