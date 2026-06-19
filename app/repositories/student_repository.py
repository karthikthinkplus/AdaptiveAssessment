from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.student import Student


class StudentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_user_id(self, user_id: UUID) -> Student | None:
        return self.db.execute(select(Student).where(Student.user_id == user_id)).scalar_one_or_none()

    def get_by_id(self, student_id: UUID) -> Student | None:
        return self.db.get(Student, student_id)

    def create(self, student: Student) -> Student:
        self.db.add(student)
        self.db.flush()
        self.db.refresh(student)
        return student
