from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, EntityMixin, jsonb_type
from app.models.role import AssessmentStatus, AttemptStatus


class Assessment(EntityMixin, Base):
    __tablename__ = "assessments"

    title: Mapped[str] = mapped_column(String(220), index=True, nullable=False)
    topic_id: Mapped[UUID | None] = mapped_column(ForeignKey("topics.id", ondelete="SET NULL"), index=True)
    created_by_user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    status: Mapped[AssessmentStatus] = mapped_column(Enum(AssessmentStatus, native_enum=False), index=True)
    config: Mapped[dict] = mapped_column(jsonb_type, default=dict, nullable=False)


class AssessmentQuestion(EntityMixin, Base):
    __tablename__ = "assessment_questions"
    __table_args__ = (
        UniqueConstraint("assessment_id", "question_id", name="uq_assessment_question"),
        Index("ix_assessment_questions_order", "assessment_id", "sequence_order"),
    )

    assessment_id: Mapped[UUID] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    sequence_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)


class AssessmentAttempt(EntityMixin, Base):
    __tablename__ = "assessment_attempts"
    __table_args__ = (Index("ix_assessment_attempts_student_status", "student_id", "status"),)

    assessment_id: Mapped[UUID] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), index=True)
    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    status: Mapped[AttemptStatus] = mapped_column(Enum(AttemptStatus, native_enum=False), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    score: Mapped[float | None] = mapped_column(Float)
    metadata_: Mapped[dict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)
