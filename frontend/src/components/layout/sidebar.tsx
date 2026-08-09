"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Brain,
  Briefcase,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Rocket,
  Search,
  Sparkles,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Job Search", href: "/jobs", icon: Briefcase },
  { name: "JD Intelligence", href: "/jd-analysis", icon: Brain },
  { name: "Interview Prep", href: "/interview-prep", icon: Mic },
  { name: "HR Answer Studio", href: "/hr-studio", icon: MessageSquare },
  { name: "AI Career Staff", href: "/mentor", icon: Bot },
  { name: "AI Coach", href: "/ai-coach", icon: Sparkles },
  { name: "Interview Journal", href: "/journal", icon: BookOpen },
  { name: "Resume Intelligence", href: "/resumes", icon: FileText },
  { name: "Learning", href: "/learning", icon: Search },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Rocket className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-sidebar-foreground">
            CareerPilot AI
          </h1>
          <p className="text-[10px] text-muted-foreground">Career Operating System</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs font-medium text-primary">Gemini AI Live</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            JD, interview prep, HR, resume coach, and career insights are generated
            live by Google Gemini — zero static answer banks.
          </p>
        </div>
      </div>
    </aside>
  );
}
