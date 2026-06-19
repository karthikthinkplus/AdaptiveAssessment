from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class SubtopicCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    difficulty_level: str | None = Field(default=None, max_length=50)
    display_order: int = 0
    mastery_threshold: float = 0.95
    is_active: bool = True


class SubtopicUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    difficulty_level: str | None = Field(default=None, max_length=50)
    display_order: int | None = None
    mastery_threshold: float | None = None
    is_active: bool | None = None


class SubtopicRead(BaseModel):
    id: UUID
    topic_id: UUID
    name: str
    description: str | None = None
    difficulty_level: str | None = None
    display_order: int
    mastery_threshold: float
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
