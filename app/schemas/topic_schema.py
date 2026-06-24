from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class TopicCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    difficulty_level: str | None = Field(default=None, max_length=50)
    display_order: int = 0
    is_active: bool = True


class TopicUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    difficulty_level: str | None = Field(default=None, max_length=50)
    display_order: int | None = None
    is_active: bool | None = None


class TopicRead(BaseModel):
    id: UUID
    name: str
    difficulty_level: str | None = None
    display_order: int
    is_active: bool
    created_by: UUID | None = None
    created_at: datetime
    updated_at: datetime
    question_count: int = 0
    active_sessions: int = 0
    completed_sessions: int = 0

    model_config = {"from_attributes": True}
