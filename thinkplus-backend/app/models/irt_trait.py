from uuid import UUID

from sqlalchemy import Float, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, EntityMixin, jsonb_type


class StudentTopicTheta(EntityMixin, Base):
    __tablename__ = "student_topic_theta"
    __table_args__ = (UniqueConstraint("student_id", "topic_id", name="uq_student_topic_theta"),)

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    topic_id: Mapped[UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    theta: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    standard_error: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    posterior: Mapped[dict] = mapped_column(jsonb_type, default=dict, nullable=False)


class ThetaHistory(EntityMixin, Base):
    __tablename__ = "theta_history"
    __table_args__ = (Index("ix_theta_history_student_topic_created", "student_id", "topic_id", "created_at"),)

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    topic_id: Mapped[UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    response_id: Mapped[UUID | None] = mapped_column(ForeignKey("student_responses.id", ondelete="SET NULL"), index=True)
    theta_before: Mapped[float] = mapped_column(Float, nullable=False)
    theta_after: Mapped[float] = mapped_column(Float, nullable=False)
    standard_error: Mapped[float] = mapped_column(Float, nullable=False)
    posterior: Mapped[dict] = mapped_column(jsonb_type, nullable=False)
