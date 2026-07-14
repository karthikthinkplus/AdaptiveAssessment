from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class DoubtCreateRequest(BaseModel):
    question_text: str = Field(min_length=4, max_length=5000)
    image_data: str | None = None


class DoubtResolveRequest(BaseModel):
    explanation_text: str = Field(min_length=2, max_length=10000)
    explanation_link: str | None = Field(default=None, max_length=1000)
    explanation_image_data: str | None = None


class DoubtSummary(BaseModel):
    id: UUID
    question_text: str
    image_data: str | None = None
    status: str
    duplicate_count: int
    explanation_text: str | None = None
    explanation_link: str | None = None
    explanation_image_data: str | None = None
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None = None

    model_config = {"from_attributes": True}
