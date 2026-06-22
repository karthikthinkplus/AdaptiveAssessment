from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.student_response import StudentResponse


class ResponseRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, response: StudentResponse) -> StudentResponse:
        self.db.add(response)
        self.db.flush()
        self.db.refresh(response)
        return response

    def list_by_session(self, session_id: UUID) -> list[StudentResponse]:
        stmt = select(StudentResponse).where(StudentResponse.session_id == session_id)
        return list(self.db.execute(stmt).scalars().all())

    def list_valid_by_student_topic(self, student_id: UUID, topic_id: UUID) -> list[StudentResponse]:
        stmt = select(StudentResponse).where(
            StudentResponse.student_id == student_id,
            StudentResponse.topic_id == topic_id,
            StudentResponse.event_type == "valid",
        )
        return list(self.db.execute(stmt).scalars().all())
