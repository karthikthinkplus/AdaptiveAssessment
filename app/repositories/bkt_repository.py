from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.bkt_state import StudentBKTState


class BKTRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_state(self, student_id: UUID, subtopic_id: UUID) -> StudentBKTState | None:
        stmt = select(StudentBKTState).where(
            StudentBKTState.student_id == student_id,
            StudentBKTState.subtopic_id == subtopic_id,
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def list_by_student(self, student_id: UUID) -> list[StudentBKTState]:
        stmt = select(StudentBKTState).where(StudentBKTState.student_id == student_id)
        return list(self.db.execute(stmt).scalars().all())

    def save(self, state: StudentBKTState) -> StudentBKTState:
        self.db.add(state)
        self.db.flush()
        self.db.refresh(state)
        return state
