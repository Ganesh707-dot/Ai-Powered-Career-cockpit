import type { JobPortal, WorkModePref } from "@/stores/profile-store";

export interface PortalSearchParams {
  targetRole: string;
  skills: string[];
  location: string;
  minSalaryLPA: number;
  yearsExperience: number;
  workMode: WorkModePref;
}

function query(text: string) {
  return encodeURIComponent(text.trim());
}

function keywords(role: string, skills: string[]) {
  const top = skills.slice(0, 4).join(" ");
  return query(top ? `${role} ${top}` : role);
}

/** Build one-click search URLs for major job portals (no paid APIs). */
export function buildPortalSearchUrl(
  portal: JobPortal,
  params: PortalSearchParams
): string {
  const { targetRole, skills, location, minSalaryLPA, yearsExperience, workMode } =
    params;
  const kw = keywords(targetRole, skills);
  const loc = query(location || "India");

  switch (portal) {
    case "LinkedIn":
      return `https://www.linkedin.com/jobs/search/?keywords=${kw}&location=${loc}&f_E=${yearsExperience >= 5 ? 5 : yearsExperience >= 3 ? 4 : 3}&f_WT=${workMode === "Remote" ? 2 : workMode === "Hybrid" ? 3 : 1}`;
    case "Naukri":
      return `https://www.naukri.com/${query(targetRole.toLowerCase().replace(/\s+/g, "-"))}-jobs?k=${kw}&experience=${Math.min(Math.max(yearsExperience, 1), 15)}&ctc=${minSalaryLPA}&location=${loc}`;
    case "Indeed":
      return `https://in.indeed.com/jobs?q=${kw}&l=${loc}&salary=${minSalaryLPA}00000`;
    case "Wellfound":
      return `https://wellfound.com/jobs?query=${kw}&locations[]=${loc}`;
    case "Instahyre":
      return `https://www.instahyre.com/search-jobs/?q=${kw}`;
    case "Glassdoor":
      return `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${kw}&locT=C&locId=115&minSalary=${minSalaryLPA * 100000}`;
    default:
      return `https://www.google.com/search?q=${kw}+jobs+${loc}`;
  }
}

export const PORTAL_META: Record<
  JobPortal,
  { label: string; color: string; description: string }
> = {
  LinkedIn: {
    label: "LinkedIn",
    color: "from-blue-600/20 to-blue-400/10 border-blue-500/30",
    description: "Professional network & referrals",
  },
  Naukri: {
    label: "Naukri",
    color: "from-indigo-600/20 to-indigo-400/10 border-indigo-500/30",
    description: "India's largest job board",
  },
  Indeed: {
    label: "Indeed",
    color: "from-emerald-600/20 to-emerald-400/10 border-emerald-500/30",
    description: "Broad listings & salary filters",
  },
  Wellfound: {
    label: "Wellfound",
    color: "from-orange-600/20 to-orange-400/10 border-orange-500/30",
    description: "Startups & early-stage roles",
  },
  Instahyre: {
    label: "Instahyre",
    color: "from-purple-600/20 to-purple-400/10 border-purple-500/30",
    description: "Curated tech hiring",
  },
  Glassdoor: {
    label: "Glassdoor",
    color: "from-teal-600/20 to-teal-400/10 border-teal-500/30",
    description: "Salaries & company reviews",
  },
};
