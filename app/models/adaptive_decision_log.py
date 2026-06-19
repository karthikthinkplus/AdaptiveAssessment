import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class AdaptiveDecisionLog(Base):
    __tablename__ = "adaptive_decision_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("learning_sessions.id", ondelete="CASCADE"), nullable=False
    )
    response_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_responses.id")
    )
    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    from_subtopic_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subtopics.id")
    )
    to_subtopic_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subtopics.id")
    )
    previous_mastery: Mapped[float | None] = mapped_column(Float)
    updated_mastery: Mapped[float | None] = mapped_column(Float)
    previous_theta: Mapped[float | None] = mapped_column(Float)
    updated_theta: Mapped[float | None] = mapped_column(Float)
    navigation_action: Mapped[str] = mapped_column(String(50), nullable=False)
    difficulty_gate: Mapped[str | None] = mapped_column(String(50))
    candidate_pool_size: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    selected_question_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("questions.id")
    )
    selection_reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
