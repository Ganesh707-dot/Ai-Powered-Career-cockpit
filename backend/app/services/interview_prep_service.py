"""Interview prep & HR answers — Gemini for content, instant UI catalogs."""

from __future__ import annotations

import time

from app.schemas.interview_prep import (
    HRAnswerRequest,
    HRAnswerResponse,
    HRAnswerStyle,
    InterviewPrepRequest,
    InterviewPrepResponse,
    InterviewQuestion,
    MockInterviewRequest,
    MockInterviewResponse,
)
from app.services.ai_client import GeminiClient, gemini_client

# Instant UI labels only — answers/questions are still Gemini-generated.
INTERVIEW_CATEGORIES = [
    "HR",
    "Behavioral",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "System Design",
    "Databases",
    "REST APIs",
    "Performance",
    "Security",
]

HR_QUESTION_CATALOG = [
    {"key": "tell_me_about_yourself", "question": "Tell me about yourself."},
    {"key": "why_this_company", "question": "Why do you want to join this company?"},
    {"key": "why_leave", "question": "Why are you leaving your current role?"},
    {"key": "strengths", "question": "What are your greatest strengths?"},
    {"key": "weaknesses", "question": "What is your biggest weakness?"},
    {"key": "leadership", "question": "Describe your leadership experience."},
    {"key": "conflict_resolution", "question": "How do you handle conflict with a colleague?"},
    {"key": "career_goals", "question": "What are your career goals?"},
    {"key": "salary_expectations", "question": "What are your salary expectations?"},
]

PREP_SYSTEM = "Interview coach. Compact JSON only. Short answers."
HR_SYSTEM = "HR interview coach. Compact JSON only. Speakable answers."
MOCK_SYSTEM = "Strict interview evaluator. Compact JSON only."


class InterviewPrepService:
    def __init__(self, client: GeminiClient | None = None) -> None:
        self.client = client or gemini_client

    def generate(self, request: InterviewPrepRequest) -> InterviewPrepResponse:
        started = time.perf_counter()
        categories = (request.categories or INTERVIEW_CATEGORIES[:4])[:4]
        skills = ", ".join(request.skills[:8]) or "full-stack"
        count = request.count if not request.fast_mode else min(request.count, 6)
        difficulty = request.difficulty or "Mixed"

        prompt = f"""Generate {count} interview Qs. Keep expected_answer ≤40 words.

Company:{request.company or "product company"} Role:{request.role or "SWE"}
Skills:{skills} Categories:{", ".join(categories)} Difficulty:{difficulty}

JSON:{{"questions":[{{"question":"","expected_answer":"","evaluation_criteria":"","difficulty":"Easy|Medium|Hard","category":""}}]}}
"""
        data = self.client.generate_json(
            PREP_SYSTEM,
            prompt,
            temperature=0.35,
            max_output_tokens=1100 if request.fast_mode else 1800,
        )
        questions: list[InterviewQuestion] = []
        for item in (data.get("questions") or [])[:count]:
            if not isinstance(item, dict):
                continue
            question = str(item.get("question") or "").strip()
            if not question:
                continue
                questions.append(
                    InterviewQuestion(
                    question=question,
                    expected_answer=str(item.get("expected_answer") or "").strip(),
                    evaluation_criteria=str(item.get("evaluation_criteria") or "").strip(),
                    difficulty=str(item.get("difficulty") or "Medium").strip(),
                    category=str(item.get("category") or "General").strip(),
                )
            )
        elapsed = int((time.perf_counter() - started) * 1000)
        return InterviewPrepResponse(
            questions=questions, total=len(questions), latency_hint_ms=elapsed
        )

    def generate_hr_answers(self, request: HRAnswerRequest) -> HRAnswerResponse:
        catalog = {item["key"]: item["question"] for item in HR_QUESTION_CATALOG}
        question = (
            catalog.get(request.question_key)
            or request.question_key.replace("_", " ").strip()
            or "Tell me about yourself."
        )
        experience = (
            request.user_experience.strip()[:500]
            if request.user_experience.strip()
            else "Recent production impact with measurable results."
        )
        styles = "concise,detailed" if request.fast_mode else "concise,detailed,storytelling"
        style_count = 2 if request.fast_mode else 3
        prompt = f"""Write {style_count} HR answers ({styles}). Each ≤80 words.

Q:{question}
Role:{request.target_role} YOE:{request.years_experience}
Company:{request.company or "the company"}
Experience:{experience}

JSON:{{"question":"","answers":[{{"style":"","answer":""}}]}}
"""
        data = self.client.generate_json(
            HR_SYSTEM,
            prompt,
            temperature=0.45,
            max_output_tokens=900 if request.fast_mode else 1400,
        )
        answers = []
        for item in data.get("answers") or []:
            if not isinstance(item, dict):
                continue
            style = str(item.get("style") or "").strip()
            answer = str(item.get("answer") or "").strip()
            if style and answer:
                answers.append(HRAnswerStyle(style=style, answer=answer))
        return HRAnswerResponse(
            question=str(data.get("question") or question),
            answers=answers,
        )

    def evaluate_mock(self, request: MockInterviewRequest) -> MockInterviewResponse:
        skills = ", ".join(request.skills[:8]) or "general"
        prompt = f"""Score this interview answer 0-100.

Role:{request.role} Company:{request.company or "n/a"} Skills:{skills}
Q:{request.question[:500]}
A:{request.answer[:1200]}

JSON:{{"score":0,"verdict":"","strengths":[],"improvements":[],"better_answer":""}}
Keep better_answer ≤90 words. Arrays max 3.
"""
        data = self.client.generate_json(
            MOCK_SYSTEM, prompt, temperature=0.3, max_output_tokens=700
        )
        return MockInterviewResponse(
            score=int(data.get("score") or 0),
            verdict=str(data.get("verdict") or "").strip(),
            strengths=[str(x) for x in (data.get("strengths") or []) if str(x).strip()][:3],
            improvements=[
                str(x) for x in (data.get("improvements") or []) if str(x).strip()
            ][:3],
            better_answer=str(data.get("better_answer") or "").strip(),
        )

    def get_hr_question_keys(self) -> list[dict]:
        return list(HR_QUESTION_CATALOG)

    def get_categories(self) -> list[str]:
        return list(INTERVIEW_CATEGORIES)
