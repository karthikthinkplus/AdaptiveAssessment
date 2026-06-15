from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.question_schema import QuestionCreate, QuestionRead
from app.services.question_service import QuestionService

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.post("", response_model=QuestionRead, status_code=201)
def create_question(
    payload: QuestionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return QuestionService(db).create_question(payload, user.id)
