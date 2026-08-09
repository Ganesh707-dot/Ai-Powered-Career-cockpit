export type JobSource =
  | "LinkedIn"
  | "Naukri"
  | "Indeed"
  | "Wellfound"
  | "Instahyre"
  | "Company Careers"
  | "Other";

export type WorkMode = "Remote" | "Hybrid" | "Onsite";

export type Priority = "Low" | "Medium" | "High" | "Urgent";

export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Phone Screen"
  | "Technical"
  | "Onsite"
  | "Offer"
  | "Rejected"
  | "Withdrawn"
  | "Ghosted";

export interface Application {
  id: number;
  company: string;
  role: string;
  job_url?: string | null;
  source: JobSource;
  salary?: string | null;
  experience?: string | null;
  location?: string | null;
  work_mode: WorkMode;
  skills_required?: string | null;
  priority: Priority;
  status: ApplicationStatus;
  notes?: string | null;
  tags?: string | null;
  application_date?: string | null;
  follow_up_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationListResponse {
  items: Application[];
  total: number;
}

export interface DashboardStats {
  total_applications: number;
  today_applications: number;
  interviews_scheduled: number;
  offers: number;
  rejections: number;
  follow_ups_due: number;
  weekly_goal: number;
  weekly_progress: number;
  saved: number;
  applied: number;
  in_progress: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface UpcomingInterview {
  id: number;
  company: string;
  role: string;
  status: string;
  follow_up_date?: string | null;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recent_activity: RecentActivity[];
  upcoming_interviews: UpcomingInterview[];
}

export interface JDAnalysisResponse {
  company?: string | null;
  role?: string | null;
  experience?: string | null;
  technical_skills: string[];
  soft_skills: string[];
  databases: string[];
  cloud: string[];
  devops: string[];
  responsibilities: string[];
  keywords: string[];
  match_score?: number | null;
  match_available?: boolean;
  match_note?: string | null;
  strength_areas: string[];
  missing_skills: string[];
  resume_suggestions: string[];
  interview_focus_topics: string[];
  learning_recommendations: string[];
}

export interface InterviewQuestion {
  question: string;
  expected_answer: string;
  evaluation_criteria: string;
  difficulty: string;
  category: string;
}

export interface InterviewPrepResponse {
  questions: InterviewQuestion[];
  total: number;
}

export interface HRAnswerStyle {
  style: string;
  answer: string;
}

export interface HRAnswerResponse {
  question: string;
  answers: HRAnswerStyle[];
}

export interface HRQuestion {
  key: string;
  question: string;
}

export type InterviewOutcome =
  | "Pending"
  | "Passed"
  | "Failed"
  | "Offer"
  | "Withdrawn";

export interface InterviewJournal {
  id: number;
  company: string;
  role?: string | null;
  round: string;
  interviewer?: string | null;
  questions_asked?: string | null;
  my_answers?: string | null;
  better_answers?: string | null;
  feedback?: string | null;
  mistakes?: string | null;
  lessons_learned?: string | null;
  confidence_rating?: number | null;
  outcome: InterviewOutcome;
  interview_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewJournalListResponse {
  items: InterviewJournal[];
  total: number;
}

export type ResumeType =
  | "React Resume"
  | "Next.js Resume"
  | "Angular Resume"
  | "Full Stack Resume"
  | "AI Resume"
  | "Custom";

export interface Resume {
  id: number;
  name: string;
  resume_type: ResumeType;
  target_role?: string | null;
  skills_highlighted?: string | null;
  notes?: string | null;
  file_path?: string | null;
  original_filename?: string | null;
  has_file?: boolean;
  has_extracted_text?: boolean;
  extracted_text_preview?: string | null;
  last_updated?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeListResponse {
  items: Resume[];
  total: number;
}

export type TopicStatus = "Planned" | "In Progress" | "Completed";

export type LearningCategory =
  | "JavaScript"
  | "TypeScript"
  | "React"
  | "Next.js"
  | "Angular"
  | "Node.js"
  | "SQL"
  | "System Design"
  | "DSA"
  | "Other";

export interface LearningTopic {
  id: number;
  title: string;
  category: LearningCategory;
  status: TopicStatus;
  notes?: string | null;
  resources?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningTopicListResponse {
  items: LearningTopic[];
  total: number;
}

export interface AnalyticsTrend {
  date: string;
  count: number;
}

export interface SkillFrequency {
  skill: string;
  count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface AnalyticsResponse {
  application_trends: AnalyticsTrend[];
  status_distribution: StatusDistribution[];
  interview_conversion_rate: number;
  offer_rate: number;
  top_skills: SkillFrequency[];
  skill_gaps: SkillFrequency[];
  companies_applied: string[];
  weekly_progress: AnalyticsTrend[];
}

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Saved",
  "Applied",
  "Phone Screen",
  "Technical",
  "Onsite",
  "Offer",
  "Rejected",
  "Withdrawn",
  "Ghosted",
];

export const JOB_SOURCES: JobSource[] = [
  "LinkedIn",
  "Naukri",
  "Indeed",
  "Wellfound",
  "Instahyre",
  "Company Careers",
  "Other",
];

export const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Urgent"];

export const WORK_MODES: WorkMode[] = ["Remote", "Hybrid", "Onsite"];

export const LEARNING_CATEGORIES: LearningCategory[] = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Angular",
  "Node.js",
  "SQL",
  "System Design",
  "DSA",
  "Other",
];

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Saved: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  Applied: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Phone Screen": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Technical: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Onsite: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Offer: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  Withdrawn: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  Ghosted: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  Low: "text-zinc-400",
  Medium: "text-blue-400",
  High: "text-amber-400",
  Urgent: "text-red-400",
};
