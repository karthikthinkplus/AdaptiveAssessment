from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class IRTTraitRead(BaseModel):
    id: UUID
    student_id: UUID
    topic_id: UUID
    theta: float
    theta_variance: float
    standard_error: float
    estimation_method: str
    valid_response_count: int
    last_response_id: UUID | None = None
    last_updated_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
