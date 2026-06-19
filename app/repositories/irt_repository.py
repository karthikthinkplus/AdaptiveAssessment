from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.irt_trait import StudentIRTTrait


class IRTRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_trait(self, student_id: UUID, topic_id: UUID) -> StudentIRTTrait | None:
        stmt = select(StudentIRTTrait).where(
            StudentIRTTrait.student_id == student_id,
            StudentIRTTrait.topic_id == topic_id,
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def list_by_student(self, student_id: UUID) -> list[StudentIRTTrait]:
        stmt = select(StudentIRTTrait).where(StudentIRTTrait.student_id == student_id)
        return list(self.db.execute(stmt).scalars().all())

    def save(self, trait: StudentIRTTrait) -> StudentIRTTrait:
        self.db.add(trait)
        self.db.flush()
        self.db.refresh(trait)
        return trait
