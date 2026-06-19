from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database.session import get_db
from app.exceptions import success_response
from app.schemas.question_schema import QuestionCreate, QuestionRead, QuestionUpdate
from app.services.question_service import QuestionService

router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("")
def list_questions(db: Session = Depends(get_db)):
    questions = QuestionService(db).list_questions()
    return success_response(
        "Questions fetched successfully",
        [QuestionRead.model_validate(item).model_dump() for item in questions],
    )


@router.get("/{question_id}")
def get_question(question_id: UUID, db: Session = Depends(get_db)):
    question = QuestionService(db).get_question(question_id)
    return success_response("Question fetched successfully", QuestionRead.model_validate(question).model_dump())


@router.post("")
def create_question(
    payload: QuestionCreate,
    current_user=Depends(require_roles(["admin", "content_manager"])),
    db: Session = Depends(get_db),
):
    question = QuestionService(db).create_question(payload, current_user.id)
    return success_response("Question created successfully", QuestionRead.model_validate(question).model_dump())


@router.patch("/{question_id}")
def update_question(
    question_id: UUID,
    payload: QuestionUpdate,
    _: object = Depends(require_roles(["admin", "content_manager"])),
    db: Session = Depends(get_db),
):
    question = QuestionService(db).update_question(question_id, payload)
    return success_response("Question updated successfully", QuestionRead.model_validate(question).model_dump())
