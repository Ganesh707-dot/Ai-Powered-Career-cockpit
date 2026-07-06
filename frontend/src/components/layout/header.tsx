"use client";

import { usePathname } from "next/navigation";
import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/": "Executive Dashboard",
  "/jobs": "Job Search Workspace",
  "/jd-analysis": "Job Description Intelligence",
  "/interview-prep": "Interview Preparation Center",
  "/hr-studio": "HR Answer Studio",
  "/journal": "Interview Journal",
  "/resumes": "Resume Intelligence",
  "/learning": "Learning Dashboard",
  "/analytics": "Analytics",
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "CareerPilot AI";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
        </Button>
        <Button asChild size="sm">
          <Link href="/jobs?action=new">
            <Plus className="h-4 w-4" />
            New Application
          </Link>
        </Button>
      </div>
    </header>
  );
}
