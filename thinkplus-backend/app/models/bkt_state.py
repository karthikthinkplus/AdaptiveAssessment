from uuid import UUID

from sqlalchemy import Float, ForeignKey, Index, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, EntityMixin, jsonb_type


class StudentBKTState(EntityMixin, Base):
    __tablename__ = "student_bkt_states"
    __table_args__ = (UniqueConstraint("student_id", "subtopic_id", name="uq_student_bkt_state"),)

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    subtopic_id: Mapped[UUID] = mapped_column(ForeignKey("subtopics.id", ondelete="CASCADE"), index=True)
    mastery_probability: Mapped[float] = mapped_column(Float, default=0.2, nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    correct_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    parameters: Mapped[dict] = mapped_column(jsonb_type, default=dict, nullable=False)


class BKTHistory(EntityMixin, Base):
    __tablename__ = "bkt_history"
    __table_args__ = (Index("ix_bkt_history_student_subtopic_created", "student_id", "subtopic_id", "created_at"),)

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    subtopic_id: Mapped[UUID] = mapped_column(ForeignKey("subtopics.id", ondelete="CASCADE"), index=True)
    response_id: Mapped[UUID | None] = mapped_column(ForeignKey("student_responses.id", ondelete="SET NULL"), index=True)
    prior_probability: Mapped[float] = mapped_column(Float, nullable=False)
    posterior_probability: Mapped[float] = mapped_column(Float, nullable=False)
    parameters: Mapped[dict] = mapped_column(jsonb_type, nullable=False)
