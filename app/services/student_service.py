from sqlalchemy.orm import Session

from app.repositories.student_repository import StudentRepository


class StudentService:
    def __init__(self, db: Session) -> None:
        self.repo = StudentRepository(db)
