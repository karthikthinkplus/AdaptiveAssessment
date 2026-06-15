from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import DateTime, Enum, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, EntityMixin, jsonb_type
from app.models.role import SessionStatus


class LearningSession(EntityMixin, Base):
    __tablename__ = "learning_sessions"
    __table_args__ = (Index("ix_learning_sessions_student_status", "student_id", "status"),)

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    topic_id: Mapped[UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    current_subtopic_id: Mapped[UUID | None] = mapped_column(ForeignKey("subtopics.id", ondelete="SET NULL"), index=True)
    status: Mapped[SessionStatus] = mapped_column(Enum(SessionStatus, native_enum=False), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    metadata_: Mapped[dict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)
