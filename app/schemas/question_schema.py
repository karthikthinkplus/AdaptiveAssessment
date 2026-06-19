from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class QuestionOptionCreate(BaseModel):
    option_label: str = Field(min_length=1, max_length=10)
    option_text: str = Field(min_length=1)
    is_correct: bool = False
    display_order: int = 0


class QuestionOptionRead(QuestionOptionCreate):
    id: UUID
    question_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StudentQuestionOptionRead(BaseModel):
    id: UUID
    option_label: str
    option_text: str
    display_order: int

    model_config = {"from_attributes": True}


class QuestionCreate(BaseModel):
    topic_id: UUID
    subtopic_id: UUID
    passage_id: UUID | None = None
    question_code: str | None = None
    question_text: str
    question_type: str = "mcq"
    difficulty_level: str
    difficulty_b: float = 0.0
    discrimination_a: float = 1.0
    guessing_c: float = 0.0
    correct_answer: str | None = None
    estimated_time_seconds: int | None = None
    status: str = "draft"
    reviewed_by: UUID | None = None
    options: list[QuestionOptionCreate] = Field(default_factory=list)


class QuestionUpdate(BaseModel):
    topic_id: UUID | None = None
    subtopic_id: UUID | None = None
    passage_id: UUID | None = None
    question_code: str | None = None
    question_text: str | None = None
    question_type: str | None = None
    difficulty_level: str | None = None
    difficulty_b: float | None = None
    discrimination_a: float | None = None
    guessing_c: float | None = None
    correct_answer: str | None = None
    estimated_time_seconds: int | None = None
    status: str | None = None
    reviewed_by: UUID | None = None


class QuestionRead(BaseModel):
    id: UUID
    topic_id: UUID
    subtopic_id: UUID
    passage_id: UUID | None = None
    question_code: str | None = None
    question_text: str
    question_type: str
    difficulty_level: str
    difficulty_b: float
    discrimination_a: float
    guessing_c: float
    correct_answer: str | None = None
    estimated_time_seconds: int | None = None
    status: str
    created_by: UUID | None = None
    reviewed_by: UUID | None = None
    created_at: datetime
    updated_at: datetime
    options: list[QuestionOptionRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class StudentQuestionRead(BaseModel):
    id: UUID
    question_code: str | None = None
    question_text: str
    question_type: str
    difficulty_level: str
    estimated_time_seconds: int | None = None
    options: list[StudentQuestionOptionRead] = Field(default_factory=list)


class UploadSummary(BaseModel):
    total_rows: int
    successful_rows: int
    failed_rows: int
    created_topics: int
    created_subtopics: int
    created_passages: int
    created_questions: int
    created_options: int
    errors: list[dict]
