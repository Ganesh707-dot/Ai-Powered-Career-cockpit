from pydantic import BaseModel, Field


class InterviewQuestion(BaseModel):
    question: str
    expected_answer: str
    evaluation_criteria: str
    difficulty: str
    category: str


class InterviewPrepRequest(BaseModel):
    company: str = ""
    role: str = ""
    skills: list[str] = Field(default_factory=list)
    categories: list[str] = Field(default_factory=list)
    count: int = Field(default=6, ge=3, le=12)
    difficulty: str = "Mixed"  # Easy | Medium | Hard | Mixed
    fast_mode: bool = True


class InterviewPrepResponse(BaseModel):
    questions: list[InterviewQuestion]
    total: int
    latency_hint_ms: int | None = None


class HRAnswerRequest(BaseModel):
    question_key: str
    user_experience: str = ""
    years_experience: int = 4
    target_role: str = "Senior Full Stack Developer"
    company: str = ""
    fast_mode: bool = True


class HRAnswerStyle(BaseModel):
    style: str
    answer: str


class HRAnswerResponse(BaseModel):
    question: str
    answers: list[HRAnswerStyle]


class MockInterviewRequest(BaseModel):
    question: str = Field(..., min_length=5)
    answer: str = Field(..., min_length=5)
    role: str = "Software Engineer"
    company: str = ""
    skills: list[str] = Field(default_factory=list)


class MockInterviewResponse(BaseModel):
    score: int = 0
    verdict: str = ""
    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)
    better_answer: str = ""
