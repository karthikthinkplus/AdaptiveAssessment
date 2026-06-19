from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AdaptiveDecisionLogRead(BaseModel):
    id: UUID
    student_id: UUID
    session_id: UUID
    response_id: UUID | None = None
    topic_id: UUID
    from_subtopic_id: UUID | None = None
    to_subtopic_id: UUID | None = None
    previous_mastery: float | None = None
    updated_mastery: float | None = None
    previous_theta: float | None = None
    updated_theta: float | None = None
    navigation_action: str
    difficulty_gate: str | None = None
    candidate_pool_size: int
    selected_question_id: UUID | None = None
    selection_reason: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
