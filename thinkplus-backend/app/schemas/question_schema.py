from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.role import QuestionType


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class QuestionOptionCreate(BaseModel):
    option_key: str
    option_text: str
    is_correct: bool = False
    sequence_order: int = 0


class QuestionCreate(BaseModel):
    subtopic_id: UUID
    question_type: QuestionType = QuestionType.multiple_choice
    prompt: str
    correct_answer: str | None = None
    difficulty_b: float = Field(default=0.0, ge=-6.0, le=6.0)
    options: list[QuestionOptionCreate] = []


class QuestionRead(ORMModel):
    id: UUID
    subtopic_id: UUID
    question_type: QuestionType
    prompt: str
    difficulty_b: float
    is_active: bool
