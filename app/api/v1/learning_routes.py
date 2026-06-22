from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database.session import get_db
from app.exceptions import success_response
from app.schemas.learning_schema import StartSessionRequest, SubmitAnswerRequest
from app.services.learning_session_service import LearningSessionService

router = APIRouter(prefix="/learning", tags=["learning"])


@router.post("/sessions/start")
def start_session(
    payload: StartSessionRequest,
    current_user=Depends(require_roles(["student"])),
    db: Session = Depends(get_db),
):
    result = LearningSessionService(db).start_session(current_user.id, payload.topic_id)
    return success_response(
        "Learning session started successfully",
        {
            "session": result["session"],
            "first_question": result["first_question"].model_dump() if result["first_question"] else None,
        },
    )


@router.post("/sessions/{session_id}/submit")
def submit_answer(
    session_id: UUID,
    payload: SubmitAnswerRequest,
    current_user=Depends(require_roles(["student"])),
    db: Session = Depends(get_db),
):
    result = LearningSessionService(db).submit_answer(
        session_id,
        current_user.id,
        payload.question_id,
        payload.selected_option_id,
        payload.submitted_answer,
        payload.response_time_seconds,
    )
    result["session"] = result["session"]
    if result["next_question"]:
        result["next_question"] = result["next_question"].model_dump()
    return success_response("Answer submitted successfully", result)


@router.get("/sessions/{session_id}")
def get_session(
    session_id: UUID,
    current_user=Depends(require_roles(["student"])),
    db: Session = Depends(get_db),
):
    session = LearningSessionService(db).get_session(session_id)
    return success_response("Learning session fetched successfully", session)


@router.post("/sessions/{session_id}/pause")
def pause_session(
    session_id: UUID,
    current_user=Depends(require_roles(["student"])),
    db: Session = Depends(get_db),
):
    session = LearningSessionService(db).pause_session(session_id, current_user.id)
    return success_response("Learning session paused successfully", session)


@router.post("/sessions/{session_id}/end")
def end_session(
    session_id: UUID,
    current_user=Depends(require_roles(["student"])),
    db: Session = Depends(get_db),
):
    session = LearningSessionService(db).end_session(session_id, current_user.id)
    return success_response("Learning session ended successfully", session)
