from sqlalchemy.orm import Session

from app.models.learning_session import LearningSession
from app.models.role import SessionStatus
from app.repositories.base import Repository
from app.schemas.learning_schema import LearningSessionCreate, LearningSessionRead


class LearningSessionRepository(Repository[LearningSession]):
    model = LearningSession


class LearningSessionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.sessions = LearningSessionRepository(db)

    def start(self, payload: LearningSessionCreate) -> LearningSessionRead:
        session = self.sessions.add(LearningSession(**payload.model_dump(), status=SessionStatus.active))
        self.db.commit()
        self.db.refresh(session)
        return LearningSessionRead.model_validate(session)
