"use client";

import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NavLink } from "./nav-link";
import { useProfileStore } from "@/stores/profile-store";
import { navGroups, brand } from "@/lib/navigation";

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

export function Sidebar() {
  const profile = useProfileStore();
  const BrandIcon = brand.icon;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
          <BrandIcon className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold tracking-tight text-sidebar-foreground truncate">
            {brand.name}
          </h1>
          <p className="text-[10px] text-muted-foreground truncate">{brand.tagline}</p>
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
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-4">
        <div className="surface-elevated flex items-center gap-3 p-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {initials(profile.displayName, profile.targetRole)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">
              {profile.displayName || "Your workspace"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {profile.minSalaryLPA}–{profile.maxSalaryLPA} LPA · {profile.yearsExperience} YOE
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function SidebarBrand() {
  const BrandIcon = brand.icon;
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70">
        <BrandIcon className="h-4 w-4 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-sm font-semibold">{brand.name}</h1>
        <p className="text-[10px] text-muted-foreground">{brand.tagline}</p>
      </div>
    </Link>
  );
}
