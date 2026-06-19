from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.question_schema import StudentQuestionRead


class StartSessionRequest(BaseModel):
    topic_id: UUID


class LearningSessionRead(BaseModel):
    id: UUID
    student_id: UUID
    topic_id: UUID
    current_subtopic_id: UUID | None = None
    session_type: str
    status: str
    started_at: datetime
    ended_at: datetime | None = None
    total_questions_attempted: int
    total_correct: int
    total_time_seconds: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StartSessionResponse(BaseModel):
    session: LearningSessionRead
    first_question: StudentQuestionRead | None = None


class SubmitAnswerRequest(BaseModel):
    question_id: UUID
    selected_option_id: UUID | None = None
    submitted_answer: str | None = None
    response_time_seconds: float


class PauseSessionResponse(BaseModel):
    session: LearningSessionRead


class SubmitAnswerResponse(BaseModel):
    is_correct: bool
    event_type: str
    navigation_action: str
    session: LearningSessionRead
    next_question: StudentQuestionRead | None = None
    bkt_state: dict
    irt_state: dict
