from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.learning_schema import LearningSessionCreate, LearningSessionRead
from app.services.learning_session_service import LearningSessionService

router = APIRouter(prefix="/learning-sessions", tags=["Learning Sessions"])


@router.post("", response_model=LearningSessionRead, status_code=201)
def start_session(payload: LearningSessionCreate, db: Session = Depends(get_db)):
    return LearningSessionService(db).start(payload)
