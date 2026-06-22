from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.teacher import Teacher


class TeacherRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_user_id(self, user_id: UUID) -> Teacher | None:
        return self.db.execute(select(Teacher).where(Teacher.user_id == user_id)).scalar_one_or_none()

    def get_by_id(self, teacher_id: UUID) -> Teacher | None:
        return self.db.get(Teacher, teacher_id)

    def create(self, teacher: Teacher) -> Teacher:
        self.db.add(teacher)
        self.db.flush()
        self.db.refresh(teacher)
        return teacher
