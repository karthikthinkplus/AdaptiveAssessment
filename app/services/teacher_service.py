from sqlalchemy.orm import Session

from app.repositories.teacher_repository import TeacherRepository


class TeacherService:
    def __init__(self, db: Session) -> None:
        self.repo = TeacherRepository(db)
