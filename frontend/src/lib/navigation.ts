import {
  BarChart3,
  BookOpen,
  Brain,
  Briefcase,
  FileText,
  MessageSquare,
  Mic,
  Radar,
  Rocket,
  Search,
  Sparkles,
  Bot,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  mobilePrimary?: boolean;
  description?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavItem[] = [
  {
    name: "Career Cockpit",
    href: "/",
    icon: Radar,
    mobilePrimary: true,
    description: "Job mentor & matches",
  },
  {
    name: "Applications",
    href: "/jobs",
    icon: Briefcase,
    mobilePrimary: true,
    description: "Track your pipeline",
  },
  {
    name: "JD Intelligence",
    href: "/jd-analysis",
    icon: Brain,
    description: "Analyze job descriptions",
  },
  {
    name: "Interview Prep",
    href: "/interview-prep",
    icon: Mic,
    mobilePrimary: true,
    description: "Practice & mock drills",
  },
  {
    name: "HR Answer Studio",
    href: "/hr-studio",
    icon: MessageSquare,
    description: "Personalized HR answers",
  },
  {
    name: "AI Career Staff",
    href: "/mentor",
    icon: Bot,
    mobilePrimary: true,
    description: "Conversational mentor",
  },
  {
    name: "AI Coach",
    href: "/ai-coach",
    icon: Sparkles,
    description: "Resume & career insights",
  },
  {
    name: "Interview Journal",
    href: "/journal",
    icon: BookOpen,
    description: "Round notes & lessons",
  },
  {
    name: "Resume Intelligence",
    href: "/resumes",
    icon: FileText,
    description: "Upload & coach resumes",
  },
  {
    name: "Learning",
    href: "/learning",
    icon: Search,
    description: "Skill roadmap",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Trends & conversion",
  },
];

export const navGroups: NavGroup[] = [
  {
    label: "Command Center",
    items: navigation.filter((n) => ["/", "/jobs"].includes(n.href)),
  },
  {
    label: "AI Studio",
    items: navigation.filter((n) =>
      ["/jd-analysis", "/interview-prep", "/hr-studio", "/mentor", "/ai-coach"].includes(n.href)
    ),
  },
  {
    label: "Workspace",
    items: navigation.filter((n) =>
      ["/journal", "/resumes", "/learning"].includes(n.href)
    ),
  },
  {
    label: "Insights",
    items: navigation.filter((n) => n.href === "/analytics"),
  },
];

export const pageTitles: Record<string, string> = {
  "/": "Career Cockpit",
  "/jobs": "Applications",
  "/jd-analysis": "JD Intelligence",
  "/interview-prep": "Interview Prep",
  "/hr-studio": "HR Answer Studio",
  "/mentor": "AI Career Staff",
  "/ai-coach": "AI Coach",
  "/journal": "Interview Journal",
  "/resumes": "Resume Intelligence",
  "/learning": "Learning Path",
  "/analytics": "Analytics",
};

export const pageDescriptions: Record<string, string> = {
  "/": "Conversational job search powered by your resume & preferences",
  "/jobs": "Manage applications, kanban pipeline, and follow-ups",
  "/jd-analysis": "Paste a JD — get personalized match score and gaps",
  "/interview-prep": "AI question packs and live answer scoring",
  "/hr-studio": "Generate HR answers in multiple styles",
  "/mentor": "Career coaching from level to target role",
  "/ai-coach": "Resume coaching and career insights",
  "/journal": "Log interview rounds and lessons learned",
  "/resumes": "Upload PDF/DOCX and get AI coaching",
  "/learning": "AI-generated learning roadmap",
  "/analytics": "Application trends and skill frequency",
};

export const mobilePrimaryNav = navigation.filter((item) => item.mobilePrimary);

/** Bottom tab bar — mobile only (lg:hidden) */
export const mobileTabs = [
  {
    name: "Home",
    href: "/",
    icon: Radar,
    match: (pathname: string) => pathname === "/",
  },
  {
    name: "Jobs",
    href: "/jobs",
    icon: Briefcase,
    match: (pathname: string) => pathname.startsWith("/jobs"),
  },
  {
    name: "Prep",
    href: "/interview-prep",
    icon: Mic,
    match: (pathname: string) => pathname.startsWith("/interview-prep"),
  },
  {
    name: "Mentor",
    href: "/mentor",
    icon: Bot,
    match: (pathname: string) => pathname.startsWith("/mentor"),
  },
] as const;

export function isMobileMoreRoute(pathname: string) {
  return !mobileTabs.some((tab) => tab.match(pathname));
}

export const brand = {
  name: "CareerPilot AI",
  tagline: "Enterprise career cockpit",
  icon: Rocket,
};
