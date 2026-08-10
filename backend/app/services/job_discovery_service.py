"""Curated demo job catalog — no paid external APIs. Realistic India tech roles ~12–35 LPA."""

from __future__ import annotations

from app.schemas.job_discovery import (
    DiscoveredJob,
    JobDiscoveryRequest,
    JobDiscoveryResponse,
)

# fmt: off
CURATED_JOBS: list[dict] = [
    {"id": "j001", "company": "Razorpay", "role": "Senior Full Stack Engineer", "source": "LinkedIn",
     "salary_min_lpa": 18, "salary_max_lpa": 28, "experience_years": "3-5", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
     "description": "Build payment dashboards and merchant tools. Strong React + backend API design.",
     "job_url": "https://www.linkedin.com/jobs/search/?keywords=razorpay+full+stack", "posted_days_ago": 2},
    {"id": "j002", "company": "Swiggy", "role": "Frontend Engineer (React)", "source": "Naukri",
     "salary_min_lpa": 15, "salary_max_lpa": 24, "experience_years": "2-4", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["React", "TypeScript", "Next.js", "Performance", "Redux"],
     "description": "Consumer-facing web apps at scale. Core web vitals and design systems experience valued.",
     "job_url": "https://www.naukri.com/swiggy-frontend-jobs", "posted_days_ago": 1},
    {"id": "j003", "company": "PhonePe", "role": "SDE II — Backend", "source": "Naukri",
     "salary_min_lpa": 20, "salary_max_lpa": 32, "experience_years": "3-6", "location": "Bangalore",
     "work_mode": "Onsite", "skills": ["Java", "Spring Boot", "Kafka", "Microservices", "Redis"],
     "description": "High-throughput payments platform. Distributed systems and JVM tuning.",
     "job_url": "https://www.naukri.com/phonepe-backend-jobs", "posted_days_ago": 3},
    {"id": "j004", "company": "Freshworks", "role": "Full Stack Developer", "source": "Indeed",
     "salary_min_lpa": 14, "salary_max_lpa": 22, "experience_years": "2-5", "location": "Chennai",
     "work_mode": "Hybrid", "skills": ["React", "Ruby on Rails", "PostgreSQL", "REST APIs"],
     "description": "SaaS product engineering. End-to-end feature ownership from UI to DB.",
     "job_url": "https://in.indeed.com/jobs?q=freshworks+full+stack", "posted_days_ago": 5},
    {"id": "j005", "company": "Zoho", "role": "Senior Software Engineer", "source": "Naukri",
     "salary_min_lpa": 12, "salary_max_lpa": 20, "experience_years": "3-5", "location": "Chennai",
     "work_mode": "Onsite", "skills": ["JavaScript", "Java", "React", "MySQL", "Algorithms"],
     "description": "Product suite engineering. In-house stack, strong CS fundamentals expected.",
     "job_url": "https://www.naukri.com/zoho-software-engineer-jobs", "posted_days_ago": 4},
    {"id": "j006", "company": "CRED", "role": "React Native Engineer", "source": "LinkedIn",
     "salary_min_lpa": 18, "salary_max_lpa": 30, "experience_years": "3-5", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["React Native", "TypeScript", "Mobile", "Performance"],
     "description": "Premium fintech mobile experience. Bridge native modules and smooth animations.",
     "job_url": "https://www.linkedin.com/jobs/search/?keywords=cred+react+native", "posted_days_ago": 2},
    {"id": "j007", "company": "Meesho", "role": "Senior Frontend Engineer", "source": "Indeed",
     "salary_min_lpa": 16, "salary_max_lpa": 26, "experience_years": "3-5", "location": "Bangalore",
     "work_mode": "Remote", "skills": ["React", "Next.js", "TypeScript", "GraphQL", "Tailwind"],
     "description": "Seller and buyer web platforms. Remote-first with quarterly meetups.",
     "job_url": "https://in.indeed.com/jobs?q=meesho+frontend", "posted_days_ago": 1},
    {"id": "j008", "company": "Postman", "role": "Full Stack Engineer", "source": "Wellfound",
     "salary_min_lpa": 20, "salary_max_lpa": 35, "experience_years": "4-7", "location": "Bangalore",
     "work_mode": "Remote", "skills": ["React", "Node.js", "Electron", "TypeScript", "API Design"],
     "description": "Developer tools at global scale. API platform and desktop/web clients.",
     "job_url": "https://wellfound.com/jobs?query=postman", "posted_days_ago": 6},
    {"id": "j009", "company": "Flipkart", "role": "UI Engineer II", "source": "Naukri",
     "salary_min_lpa": 15, "salary_max_lpa": 25, "experience_years": "2-4", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["React", "JavaScript", "CSS", "Webpack", "Accessibility"],
     "description": "E-commerce storefront performance. A/B testing and component libraries.",
     "job_url": "https://www.naukri.com/flipkart-ui-engineer-jobs", "posted_days_ago": 3},
    {"id": "j010", "company": "Juspay", "role": "Senior Software Engineer", "source": "Instahyre",
     "salary_min_lpa": 22, "salary_max_lpa": 35, "experience_years": "4-6", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["Haskell", "PureScript", "React", "Functional Programming"],
     "description": "Payments orchestration. FP-friendly team, strong problem-solving culture.",
     "job_url": "https://www.instahyre.com/search-jobs/?q=juspay", "posted_days_ago": 4},
    {"id": "j011", "company": "Groww", "role": "Full Stack Developer", "source": "LinkedIn",
     "salary_min_lpa": 14, "salary_max_lpa": 22, "experience_years": "2-4", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["React", "Node.js", "MongoDB", "Kafka", "FinTech"],
     "description": "Investing platform features. Regulatory compliance awareness is a plus.",
     "job_url": "https://www.linkedin.com/jobs/search/?keywords=groww+full+stack", "posted_days_ago": 2},
    {"id": "j012", "company": "Chargebee", "role": "Senior Frontend Engineer", "source": "Wellfound",
     "salary_min_lpa": 18, "salary_max_lpa": 28, "experience_years": "3-5", "location": "Chennai",
     "work_mode": "Remote", "skills": ["React", "TypeScript", "Ember", "SaaS", "Billing"],
     "description": "Subscription billing UI. Complex data grids and workflow builders.",
     "job_url": "https://wellfound.com/jobs?query=chargebee", "posted_days_ago": 7},
    {"id": "j013", "company": "Dezerv", "role": "Backend Engineer", "source": "Instahyre",
     "salary_min_lpa": 16, "salary_max_lpa": 24, "experience_years": "2-4", "location": "Mumbai",
     "work_mode": "Hybrid", "skills": ["Python", "FastAPI", "PostgreSQL", "AWS", "FinTech"],
     "description": "Wealth-tech APIs. Clean architecture and observability from day one.",
     "job_url": "https://www.instahyre.com/search-jobs/?q=dezerv", "posted_days_ago": 5},
    {"id": "j014", "company": "BrowserStack", "role": "Software Engineer II", "source": "Indeed",
     "salary_min_lpa": 15, "salary_max_lpa": 23, "experience_years": "2-4", "location": "Mumbai",
     "work_mode": "Remote", "skills": ["JavaScript", "Node.js", "React", "Testing", "DevTools"],
     "description": "Developer infrastructure. Remote-friendly, global customer base.",
     "job_url": "https://in.indeed.com/jobs?q=browserstack+software", "posted_days_ago": 8},
    {"id": "j015", "company": "Druva", "role": "Cloud Full Stack Engineer", "source": "Naukri",
     "salary_min_lpa": 17, "salary_max_lpa": 27, "experience_years": "3-5", "location": "Pune",
     "work_mode": "Hybrid", "skills": ["React", "Python", "AWS", "SaaS", "Security"],
     "description": "Data protection SaaS. Cloud-native services and admin consoles.",
     "job_url": "https://www.naukri.com/druva-jobs", "posted_days_ago": 4},
    {"id": "j016", "company": "Thoughtworks", "role": "Lead Developer", "source": "LinkedIn",
     "salary_min_lpa": 20, "salary_max_lpa": 30, "experience_years": "5-8", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["Consulting", "React", "Java", "TDD", "System Design"],
     "description": "Client delivery leadership. Pairing, CI/CD, and agile coaching.",
     "job_url": "https://www.linkedin.com/jobs/search/?keywords=thoughtworks+lead", "posted_days_ago": 6},
    {"id": "j017", "company": "Hasura", "role": "Full Stack Engineer", "source": "Wellfound",
     "salary_min_lpa": 18, "salary_max_lpa": 28, "experience_years": "3-5", "location": "Bangalore",
     "work_mode": "Remote", "skills": ["GraphQL", "React", "TypeScript", "PostgreSQL", "Open Source"],
     "description": "GraphQL engine and console. OSS community and developer experience focus.",
     "job_url": "https://wellfound.com/jobs?query=hasura", "posted_days_ago": 3},
    {"id": "j018", "company": "Razorpay", "role": "Frontend Engineer — Dashboards", "source": "Naukri",
     "salary_min_lpa": 16, "salary_max_lpa": 24, "experience_years": "2-4", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["React", "TypeScript", "D3.js", "Data Visualization"],
     "description": "Merchant analytics dashboards. Charts, filters, and real-time data.",
     "job_url": "https://www.naukri.com/razorpay-frontend-jobs", "posted_days_ago": 1},
    {"id": "j019", "company": "Unacademy", "role": "Senior React Developer", "source": "Indeed",
     "salary_min_lpa": 14, "salary_max_lpa": 22, "experience_years": "3-5", "location": "Bangalore",
     "work_mode": "Remote", "skills": ["React", "Next.js", "Video Streaming", "SSR"],
     "description": "Ed-tech learning experience. Video players and live class UI.",
     "job_url": "https://in.indeed.com/jobs?q=unacademy+react", "posted_days_ago": 9},
    {"id": "j020", "company": "Slice", "role": "Full Stack Engineer", "source": "Instahyre",
     "salary_min_lpa": 15, "salary_max_lpa": 25, "experience_years": "2-4", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "FinTech"],
     "description": "Credit card fintech stack. Move fast with strong code review culture.",
     "job_url": "https://www.instahyre.com/search-jobs/?q=slice", "posted_days_ago": 2},
    {"id": "j021", "company": "SAP Labs", "role": "Developer — UI5/React", "source": "Naukri",
     "salary_min_lpa": 12, "salary_max_lpa": 18, "experience_years": "2-4", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["React", "UI5", "JavaScript", "Enterprise", "Agile"],
     "description": "Enterprise ERP extensions. Stable product cycles, good work-life balance.",
     "job_url": "https://www.naukri.com/sap-labs-jobs", "posted_days_ago": 10},
    {"id": "j022", "company": "Tekion", "role": "Senior Software Engineer", "source": "LinkedIn",
     "salary_min_lpa": 18, "salary_max_lpa": 30, "experience_years": "4-6", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["React", "Java", "Microservices", "Automotive", "Cloud"],
     "description": "Automotive retail cloud. Greenfield modules and platform modernization.",
     "job_url": "https://www.linkedin.com/jobs/search/?keywords=tekion+software", "posted_days_ago": 5},
    {"id": "j023", "company": "LambdaTest", "role": "Frontend Engineer", "source": "Wellfound",
     "salary_min_lpa": 13, "salary_max_lpa": 20, "experience_years": "2-3", "location": "Noida",
     "work_mode": "Remote", "skills": ["React", "TypeScript", "Testing", "DevTools", "SaaS"],
     "description": "Testing cloud UI. Remote-first startup, fast iteration cycles.",
     "job_url": "https://wellfound.com/jobs?query=lambdatest", "posted_days_ago": 4},
    {"id": "j024", "company": "Paytm", "role": "SDE II — Payments", "source": "Naukri",
     "salary_min_lpa": 15, "salary_max_lpa": 24, "experience_years": "3-5", "location": "Noida",
     "work_mode": "Hybrid", "skills": ["Java", "Spring", "React", "Payments", "SQL"],
     "description": "Wallet and UPI flows. High availability and fraud detection adjacent work.",
     "job_url": "https://www.naukri.com/paytm-sde-jobs", "posted_days_ago": 3},
    {"id": "j025", "company": "Oracle", "role": "Applications Developer", "source": "Indeed",
     "salary_min_lpa": 12, "salary_max_lpa": 18, "experience_years": "2-4", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["Java", "React", "Oracle Cloud", "SQL", "REST"],
     "description": "Cloud applications team. Enterprise customers, structured release trains.",
     "job_url": "https://in.indeed.com/jobs?q=oracle+applications+developer+bangalore", "posted_days_ago": 12},
    {"id": "j026", "company": "CleverTap", "role": "Full Stack Engineer", "source": "Instahyre",
     "salary_min_lpa": 16, "salary_max_lpa": 26, "experience_years": "3-5", "location": "Mumbai",
     "work_mode": "Remote", "skills": ["React", "Node.js", "Kafka", "Analytics", "SaaS"],
     "description": "Customer engagement platform. Event pipelines and marketer-facing UI.",
     "job_url": "https://www.instahyre.com/search-jobs/?q=clevertap", "posted_days_ago": 6},
    {"id": "j027", "company": "Mindtickle", "role": "Senior Frontend Engineer", "source": "LinkedIn",
     "salary_min_lpa": 17, "salary_max_lpa": 27, "experience_years": "3-5", "location": "Pune",
     "work_mode": "Hybrid", "skills": ["React", "TypeScript", "Redux", "SaaS", "Sales Enablement"],
     "description": "Sales readiness SaaS. Complex permissions and multi-tenant UI patterns.",
     "job_url": "https://www.linkedin.com/jobs/search/?keywords=mindtickle+frontend", "posted_days_ago": 4},
    {"id": "j028", "company": "Innovaccer", "role": "Software Engineer — Platform", "source": "Naukri",
     "salary_min_lpa": 14, "salary_max_lpa": 22, "experience_years": "2-4", "location": "Noida",
     "work_mode": "Hybrid", "skills": ["React", "Python", "Healthcare", "API", "PostgreSQL"],
     "description": "Health cloud data platform. HIPAA-aware engineering practices.",
     "job_url": "https://www.naukri.com/innovaccer-jobs", "posted_days_ago": 7},
    {"id": "j029", "company": "ShareChat", "role": "Android / Full Stack", "source": "Indeed",
     "salary_min_lpa": 18, "salary_max_lpa": 28, "experience_years": "3-5", "location": "Bangalore",
     "work_mode": "Hybrid", "skills": ["React", "Node.js", "Kotlin", "Mobile", "Social"],
     "description": "Short-video and social features. Cross-platform and growth engineering.",
     "job_url": "https://in.indeed.com/jobs?q=sharechat+engineer", "posted_days_ago": 5},
    {"id": "j030", "company": "Atlassian", "role": "Full Stack Developer", "source": "LinkedIn",
     "salary_min_lpa": 22, "salary_max_lpa": 35, "experience_years": "4-7", "location": "Remote",
     "work_mode": "Remote", "skills": ["React", "Java", "TypeScript", "Jira", "Confluence"],
     "description": "Remote India role for global product teams. Strong communication required.",
     "job_url": "https://www.linkedin.com/jobs/search/?keywords=atlassian+india+remote", "posted_days_ago": 8},
]
# fmt: on


def _normalize(text: str) -> str:
    return text.lower().strip()


def _skill_overlap(user_skills: list[str], job_skills: list[str]) -> tuple[float, list[str]]:
    if not user_skills:
        return 0.0, []
    user = {_normalize(s) for s in user_skills}
    job = {_normalize(s) for s in job_skills}
    matched = []
    for us in user:
        for js in job:
            if us in js or js in us:
                matched.append(js.title() if js.islower() else js)
                break
    ratio = len(matched) / max(len(user), 1)
    return min(ratio * 100, 100), list(dict.fromkeys(matched))[:5]


def _salary_fit(min_lpa: float, max_lpa: float, job_min: float, job_max: float) -> tuple[float, str | None]:
    if job_max < min_lpa:
        return max(0, 40 - (min_lpa - job_max) * 10), "Below your minimum CTC"
    if job_min > max_lpa:
        return max(0, 40 - (job_min - max_lpa) * 10), "Above your max range"
    overlap = min(max_lpa, job_max) - max(min_lpa, job_min)
    span = max(job_max - job_min, 1)
    score = 60 + (overlap / span) * 40
    return min(score, 100), None


def _location_fit(locations: list[str], job_location: str) -> tuple[float, str | None]:
    if not locations:
        return 70, None
    job_loc = _normalize(job_location)
    for loc in locations:
        ln = _normalize(loc)
        if ln in job_loc or job_loc in ln or ln == "remote" or job_loc == "remote":
            return 100, None
        if ln == "india":
            return 85, None
    return 35, "Location mismatch"


def _work_mode_fit(pref: str, job_mode: str) -> tuple[float, str | None]:
    if pref in ("Any", ""):
        return 80, None
    if pref == job_mode:
        return 100, None
    if pref == "Remote" and job_mode == "Hybrid":
        return 55, "Hybrid only — not fully remote"
    if pref == "Hybrid" and job_mode == "Remote":
        return 90, None
    return 30, f"Prefers {pref}, role is {job_mode}"


def _role_fit(target_role: str, job_role: str) -> float:
    if not target_role:
        return 50
    t = _normalize(target_role)
    r = _normalize(job_role)
    t_words = set(t.split())
    r_words = set(r.split())
    overlap = len(t_words & r_words) / max(len(t_words), 1)
    return min(50 + overlap * 100, 100)


def _resume_fit(
    resume_text: str, job_skills: list[str], job_description: str
) -> tuple[float, list[str], str | None]:
    """Score how well the candidate's resume reflects this role."""
    text = resume_text.strip()
    if len(text) < 40:
        return 0.0, [], None

    resume_lower = _normalize(text)
    matched: list[str] = []

    for skill in job_skills:
        token = _normalize(skill)
        if len(token) >= 2 and token in resume_lower:
            matched.append(skill)

    # Light keyword pass on description (tech terms only)
    for term in ("react", "typescript", "node", "python", "java", "aws", "kafka", "graphql", "next.js"):
        if term in resume_lower and term in _normalize(job_description):
            label = term.title() if term != "next.js" else "Next.js"
            if label not in matched:
                matched.append(label)

    matched = list(dict.fromkeys(matched))[:6]
    if not matched:
        return 25.0, [], "Resume on file — broaden skills section for sharper matches"

    ratio = min(len(matched) / max(len(job_skills), 1), 1.0)
    score = 45 + ratio * 55
    insight = f"Your resume backs {', '.join(matched[:3])}"
    return min(score, 100), matched, insight


class JobDiscoveryService:
    def discover(self, request: JobDiscoveryRequest) -> JobDiscoveryResponse:
        results: list[DiscoveredJob] = []

        for raw in CURATED_JOBS:
            if request.sources and raw["source"] not in request.sources:
                continue

            skill_score, matched_skills = _skill_overlap(request.user_skills, raw["skills"])
            resume_score, resume_matched, resume_note = _resume_fit(
                request.resume_text, raw["skills"], raw["description"]
            )
            sal_score, sal_note = _salary_fit(
                request.min_salary_lpa,
                request.max_salary_lpa,
                raw["salary_min_lpa"],
                raw["salary_max_lpa"],
            )
            loc_score, loc_note = _location_fit(request.preferred_locations, raw["location"])
            mode_score, mode_note = _work_mode_fit(request.work_mode, raw["work_mode"])
            role_score = _role_fit(request.target_role, raw["role"])

            has_resume = len(request.resume_text.strip()) >= 40
            if has_resume:
                match_score = round(
                    skill_score * 0.22
                    + resume_score * 0.28
                    + sal_score * 0.22
                    + loc_score * 0.12
                    + mode_score * 0.08
                    + role_score * 0.08,
                    1,
                )
            else:
                match_score = round(
                    skill_score * 0.35
                    + sal_score * 0.25
                    + loc_score * 0.15
                    + mode_score * 0.10
                    + role_score * 0.15,
                    1,
                )

            reasons: list[str] = []
            if resume_matched:
                reasons.append(f"Resume fit: {', '.join(resume_matched[:3])}")
            elif resume_note and has_resume:
                reasons.append(resume_note)
            if matched_skills:
                reasons.append(f"Skills: {', '.join(matched_skills)}")
            reasons.append(f"CTC {raw['salary_min_lpa']:.0f}–{raw['salary_max_lpa']:.0f} LPA")
            if skill_score >= 50:
                reasons.append("Strong skill overlap")
            if sal_score >= 80:
                reasons.append("Salary in your range")
            for note in (sal_note, loc_note, mode_note):
                if note:
                    reasons.append(note)

            results.append(
                DiscoveredJob(
                    id=raw["id"],
                    company=raw["company"],
                    role=raw["role"],
                    source=raw["source"],
                    salary_min_lpa=raw["salary_min_lpa"],
                    salary_max_lpa=raw["salary_max_lpa"],
                    experience_years=raw["experience_years"],
                    location=raw["location"],
                    work_mode=raw["work_mode"],
                    skills=raw["skills"],
                    description=raw["description"],
                    job_url=raw["job_url"],
                    posted_days_ago=raw["posted_days_ago"],
                    match_score=match_score,
                    match_reasons=reasons[:4],
                )
            )

        results.sort(key=lambda j: (-j.match_score, j.posted_days_ago))
        limited = results[: request.limit]

        return JobDiscoveryResponse(
            items=limited,
            total=len(results),
            filters_applied={
                "target_role": request.target_role,
                "min_salary_lpa": request.min_salary_lpa,
                "max_salary_lpa": request.max_salary_lpa,
                "work_mode": request.work_mode,
                "sources": request.sources or ["all"],
            },
        )
