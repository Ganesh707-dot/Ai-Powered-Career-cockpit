import re

from app.schemas.jd_analysis import JDAnalysisRequest, JDAnalysisResponse

# Skill dictionaries for rule-based extraction
TECHNICAL_SKILLS = {
    "javascript", "typescript", "python", "java", "go", "golang", "rust",
    "c++", "c#", "ruby", "php", "swift", "kotlin", "scala",
    "react", "next.js", "nextjs", "angular", "vue", "vue.js", "svelte",
    "node.js", "nodejs", "express", "nestjs", "fastapi", "django", "flask",
    "spring", "spring boot", ".net", "graphql", "rest", "restful",
    "html", "css", "sass", "tailwind", "webpack", "vite", "babel",
    "redux", "zustand", "mobx", "rxjs", "webpack", "jest", "cypress",
    "playwright", "storybook", "microservices", "websocket", "grpc",
}

SOFT_SKILLS = {
    "communication", "leadership", "teamwork", "problem solving",
    "problem-solving", "collaboration", "mentoring", "agile", "scrum",
    "time management", "critical thinking", "adaptability", "ownership",
    "stakeholder management", "cross-functional",
}

DATABASES = {
    "postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite",
    "dynamodb", "cassandra", "elasticsearch", "firebase", "supabase",
    "sql", "nosql", "oracle", "mssql",
}

CLOUD = {
    "aws", "azure", "gcp", "google cloud", "cloudflare", "vercel",
    "netlify", "heroku", "digitalocean", "lambda", "s3", "ec2",
    "cloudfront", "ecs", "eks", "kubernetes",
}

DEVOPS = {
    "docker", "kubernetes", "k8s", "ci/cd", "jenkins", "github actions",
    "gitlab ci", "terraform", "ansible", "nginx", "linux", "bash",
    "monitoring", "prometheus", "grafana", "datadog", "helm",
}


class JDAnalysisService:
    """Rule-based JD analysis. Architecture ready for Ollama/Gemini integration."""

    def analyze(self, request: JDAnalysisRequest) -> JDAnalysisResponse:
        text = request.job_description.lower()
        user_skills = {s.lower().strip() for s in request.user_skills}

        technical = self._extract_skills(text, TECHNICAL_SKILLS)
        soft = self._extract_skills(text, SOFT_SKILLS)
        databases = self._extract_skills(text, DATABASES)
        cloud = self._extract_skills(text, CLOUD)
        devops = self._extract_skills(text, DEVOPS)

        all_jd_skills = set(technical + databases + cloud + devops)
        strength_areas = [s for s in all_jd_skills if s.lower() in user_skills]
        missing_skills = [
            s for s in all_jd_skills if s.lower() not in user_skills
        ]

        match_score = 0.0
        if all_jd_skills:
            match_score = round(len(strength_areas) / len(all_jd_skills) * 100, 1)

        company = self._extract_company(request.job_description)
        role = self._extract_role(request.job_description)
        experience = self._extract_experience(text)
        responsibilities = self._extract_responsibilities(request.job_description)
        keywords = self._extract_keywords(text)

        resume_suggestions = self._generate_resume_suggestions(
            missing_skills, strength_areas, role
        )
        interview_focus = list(set(technical[:8] + databases[:3] + cloud[:2]))
        learning_recs = [
            f"Study {skill} — required in JD but not in your skill set"
            for skill in missing_skills[:5]
        ]

        return JDAnalysisResponse(
            company=company,
            role=role,
            experience=experience,
            technical_skills=technical,
            soft_skills=soft,
            databases=databases,
            cloud=cloud,
            devops=devops,
            responsibilities=responsibilities,
            keywords=keywords,
            match_score=match_score,
            strength_areas=strength_areas,
            missing_skills=missing_skills,
            resume_suggestions=resume_suggestions,
            interview_focus_topics=interview_focus,
            learning_recommendations=learning_recs,
        )

    def _extract_skills(self, text: str, skill_set: set[str]) -> list[str]:
        found = []
        for skill in skill_set:
            if skill in text:
                found.append(skill.title() if skill.islower() else skill)
        return sorted(set(found), key=str.lower)

    def _extract_company(self, text: str) -> str | None:
        patterns = [
            r"(?:company|organization|employer)[:\s]+([A-Z][A-Za-z0-9\s&.,]+)",
            r"^([A-Z][A-Za-z0-9\s&.,]{2,30})\s+(?:is hiring|seeks|looking)",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.MULTILINE | re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None

    def _extract_role(self, text: str) -> str | None:
        patterns = [
            r"(?:position|role|title)[:\s]+([^\n]+)",
            r"(Senior|Staff|Lead|Principal|Junior|Mid)?\s*"
            r"(Full[\s-]?Stack|Frontend|Backend|Software|React|Node\.?js|"
            r"Python|DevOps|Platform|Mobile|AI|ML)\s*(Engineer|Developer|Architect)",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0).strip()[:100]
        return None

    def _extract_experience(self, text: str) -> str | None:
        match = re.search(
            r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)",
            text,
            re.IGNORECASE,
        )
        if match:
            return f"{match.group(1)}+ years"
        return None

    def _extract_responsibilities(self, text: str) -> list[str]:
        responsibilities = []
        in_section = False
        for line in text.split("\n"):
            lower = line.lower().strip()
            if any(
                kw in lower
                for kw in ["responsibilit", "what you'll do", "you will", "duties"]
            ):
                in_section = True
                continue
            if in_section and line.strip().startswith(("-", "•", "*", "·")):
                responsibilities.append(line.strip().lstrip("-•*· ").strip())
            elif in_section and not line.strip():
                break
        return responsibilities[:10]

    def _extract_keywords(self, text: str) -> list[str]:
        words = re.findall(r"\b[a-zA-Z]{3,}\b", text)
        stop_words = {
            "the", "and", "for", "with", "you", "will", "our", "are", "have",
            "this", "that", "from", "your", "able", "work", "team", "role",
        }
        freq: dict[str, int] = {}
        for w in words:
            wl = w.lower()
            if wl not in stop_words:
                freq[wl] = freq.get(wl, 0) + 1
        return [w for w, _ in sorted(freq.items(), key=lambda x: -x[1])[:20]]

    def _generate_resume_suggestions(
        self, missing: list[str], strengths: list[str], role: str | None
    ) -> list[str]:
        suggestions = []
        if missing:
            suggestions.append(
                f"Add experience with: {', '.join(missing[:5])}"
            )
        if strengths:
            suggestions.append(
                f"Highlight your expertise in: {', '.join(strengths[:5])}"
            )
        if role:
            suggestions.append(
                f"Tailor your summary for: {role}"
            )
        suggestions.append(
            "Quantify achievements with metrics (performance, scale, impact)"
        )
        suggestions.append(
            "Include relevant project links and GitHub contributions"
        )
        return suggestions
