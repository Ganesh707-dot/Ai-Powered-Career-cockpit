"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/navigation";

export function NavLink({
  item,
  onClick,
  compact,
}: {
  item: NavItem;
  onClick?: () => void;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
        compact ? "px-2.5 py-2" : "px-3 py-2.5",
        isActive
          ? "bg-primary/12 text-primary"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
      )}
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
          isActive
            ? "bg-primary/20 text-primary"
            : "bg-muted/40 text-muted-foreground group-hover:bg-muted/60 group-hover:text-foreground"
        )}
      >
        <item.icon className="h-4 w-4" />
      </span>
      {!compact && <span className="truncate">{item.name}</span>}
    </Link>
  );
}
