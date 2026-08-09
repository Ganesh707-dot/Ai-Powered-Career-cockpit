"""AI-generated learning roadmap → learning topics."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.learning_topic import LearningCategory, LearningTopic, TopicStatus
from app.schemas.mentor import LearningPathItem, LearningPathRequest, LearningPathResponse
from app.services.ai_client import GeminiClient, gemini_client

SYSTEM = """You are CareerPilot Staff designing a practical learning roadmap for software engineers.
Return ONLY compact JSON. Prefer project-based learning over theory dumps."""

CATEGORY_MAP = {
    "javascript": LearningCategory.JAVASCRIPT,
    "typescript": LearningCategory.TYPESCRIPT,
    "react": LearningCategory.REACT,
    "next.js": LearningCategory.NEXTJS,
    "nextjs": LearningCategory.NEXTJS,
    "angular": LearningCategory.ANGULAR,
    "node.js": LearningCategory.NODEJS,
    "nodejs": LearningCategory.NODEJS,
    "sql": LearningCategory.SQL,
    "system design": LearningCategory.SYSTEM_DESIGN,
    "dsa": LearningCategory.DSA,
}


class LearningPathService:
    def __init__(self, db: Session | None = None, client: GeminiClient | None = None) -> None:
        self.db = db
        self.client = client or gemini_client

    def generate(self, request: LearningPathRequest) -> LearningPathResponse:
        skills = ", ".join(request.skills) or "general full-stack"
        focus = ", ".join(request.focus_areas) or "role readiness + interviews"
        prompt = f"""Build a {request.weeks}-week learning path.

Current level: {request.current_level}
Target role: {request.target_role}
Years: {request.years_experience}
Skills: {skills}
Focus: {focus}

Return JSON:
{{
  "headline": string,
  "roadmap_summary": string,
  "items": [
    {{
      "title": string,
      "category": "JavaScript"|"TypeScript"|"React"|"Next.js"|"Angular"|"Node.js"|"SQL"|"System Design"|"DSA"|"Other",
      "week": number,
      "why": string,
      "resources": string,
      "status": "Planned"
    }}
  ]
}}

Create 1 topic per week (max {request.weeks}). Be specific and sequential.
"""
        data = self.client.generate_json(SYSTEM, prompt, temperature=0.35, max_output_tokens=1800)
        items: list[LearningPathItem] = []
        for raw in data.get("items") or []:
            if not isinstance(raw, dict):
                continue
            title = str(raw.get("title") or "").strip()
            if not title:
                continue
            items.append(
                LearningPathItem(
                    title=title,
                    category=str(raw.get("category") or "Other"),
                    week=int(raw.get("week") or len(items) + 1),
                    why=str(raw.get("why") or "").strip(),
                    resources=str(raw.get("resources") or "").strip(),
                    status="Planned",
                )
            )

        created_ids: list[int] = []
        if request.persist and self.db is not None:
            created_ids = self._persist(items, request)

        return LearningPathResponse(
            headline=str(data.get("headline") or "Your personalized roadmap"),
            roadmap_summary=str(data.get("roadmap_summary") or "").strip(),
            items=items,
            created_topic_ids=created_ids,
        )

    def _persist(self, items: list[LearningPathItem], request: LearningPathRequest) -> list[int]:
        assert self.db is not None
        ids: list[int] = []
        for item in items:
            category = self._map_category(item.category)
            topic = LearningTopic(
                title=f"Week {item.week}: {item.title}",
                category=category,
                status=TopicStatus.PLANNED,
                notes=f"Toward {request.target_role}. {item.why}",
                resources=item.resources,
            )
            self.db.add(topic)
            self.db.flush()
            ids.append(topic.id)
        self.db.commit()
        return ids

    @staticmethod
    def _map_category(label: str) -> LearningCategory:
        key = label.strip().lower()
        if key in CATEGORY_MAP:
            return CATEGORY_MAP[key]
        for name, enum_val in CATEGORY_MAP.items():
            if name in key:
                return enum_val
        return LearningCategory.OTHER
