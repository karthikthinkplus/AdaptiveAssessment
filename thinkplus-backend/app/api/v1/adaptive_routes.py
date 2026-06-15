from uuid import UUID

from fastapi import APIRouter

router = APIRouter(prefix="/adaptive", tags=["Adaptive Engine"])


@router.post("/next-question/{learning_session_id}")
def next_question(learning_session_id: UUID) -> dict:
    return {"learning_session_id": str(learning_session_id), "selected_question_id": None, "reason": "pool-empty"}
