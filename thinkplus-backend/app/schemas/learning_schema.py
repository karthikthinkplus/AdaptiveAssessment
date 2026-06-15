from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.role import SessionStatus


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class LearningSessionCreate(BaseModel):
    student_id: UUID
    topic_id: UUID
    current_subtopic_id: UUID | None = None


class LearningSessionRead(ORMModel):
    id: UUID
    student_id: UUID
    topic_id: UUID
    current_subtopic_id: UUID | None
    status: SessionStatus


class ResponseCreate(BaseModel):
    question_id: UUID
    selected_option_id: UUID | None = None
    answer_text: str | None = None
    response_time_ms: int | None = Field(default=None, ge=0)
