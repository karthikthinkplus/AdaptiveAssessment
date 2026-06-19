from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.learning_session import LearningSession


class LearningSessionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, session_id: UUID) -> LearningSession | None:
        return self.db.get(LearningSession, session_id)

    def create(self, session: LearningSession) -> LearningSession:
        self.db.add(session)
        self.db.flush()
        self.db.refresh(session)
        return session

    def list_by_student(self, student_id: UUID) -> list[LearningSession]:
        stmt = select(LearningSession).where(LearningSession.student_id == student_id)
        return list(self.db.execute(stmt).scalars().all())
