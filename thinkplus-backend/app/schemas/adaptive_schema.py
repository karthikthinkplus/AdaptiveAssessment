from uuid import UUID

from pydantic import BaseModel


class AdaptiveNextQuestionRequest(BaseModel):
    learning_session_id: UUID


class AdaptiveDecisionRead(BaseModel):
    learning_session_id: UUID
    selected_question_id: UUID | None
    reason: str
