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


class InterviewPrepResponse(BaseModel):
    questions: list[InterviewQuestion]
    total: int


class HRAnswerRequest(BaseModel):
    question_key: str
    user_experience: str = ""
    years_experience: int = 4
    target_role: str = "Senior Full Stack Developer"
    company: str = ""


class HRAnswerStyle(BaseModel):
    style: str
    answer: str


class HRAnswerResponse(BaseModel):
    question: str
    answers: list[HRAnswerStyle]
