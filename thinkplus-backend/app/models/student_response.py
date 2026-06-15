from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Index, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, EntityMixin, jsonb_type


class StudentResponse(EntityMixin, Base):
    __tablename__ = "student_responses"
    __table_args__ = (
        Index("ix_student_responses_student_question", "student_id", "question_id"),
        Index("ix_student_responses_session_created", "learning_session_id", "created_at"),
    )

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    learning_session_id: Mapped[UUID | None] = mapped_column(ForeignKey("learning_sessions.id", ondelete="CASCADE"), index=True)
    assessment_attempt_id: Mapped[UUID | None] = mapped_column(ForeignKey("assessment_attempts.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    selected_option_id: Mapped[UUID | None] = mapped_column(ForeignKey("question_options.id", ondelete="SET NULL"))
    answer_text: Mapped[str | None] = mapped_column(Text)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    response_time_ms: Mapped[int | None] = mapped_column(Integer)
    metadata_: Mapped[dict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)
