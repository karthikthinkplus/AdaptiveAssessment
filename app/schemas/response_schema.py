from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class StudentResponseRead(BaseModel):
    id: UUID
    student_id: UUID
    session_id: UUID
    question_id: UUID
    topic_id: UUID
    subtopic_id: UUID
    selected_option_id: UUID | None = None
    submitted_answer: str | None = None
    is_correct: bool
    response_time_seconds: float
    event_type: str
    attempt_number: int
    answered_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}
