from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class BKTStateRead(BaseModel):
    id: UUID
    student_id: UUID
    subtopic_id: UUID
    p_l0: float
    p_transit: float
    p_guess: float
    p_slip: float
    p_mastery: float
    mastery_status: str
    attempts_count: int
    correct_count: int
    last_response_id: UUID | None = None
    last_updated_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
