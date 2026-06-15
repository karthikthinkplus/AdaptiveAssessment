from uuid import UUID

from sqlalchemy import Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, EntityMixin, jsonb_type
from app.models.role import DecisionType


class AdaptiveDecision(EntityMixin, Base):
    __tablename__ = "adaptive_decisions"
    __table_args__ = (Index("ix_adaptive_decisions_session_created", "learning_session_id", "created_at"),)

    learning_session_id: Mapped[UUID] = mapped_column(ForeignKey("learning_sessions.id", ondelete="CASCADE"), index=True)
    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    decision_type: Mapped[DecisionType] = mapped_column(Enum(DecisionType, native_enum=False), index=True)
    selected_question_id: Mapped[UUID | None] = mapped_column(ForeignKey("questions.id", ondelete="SET NULL"), index=True)
    from_subtopic_id: Mapped[UUID | None] = mapped_column(ForeignKey("subtopics.id", ondelete="SET NULL"))
    to_subtopic_id: Mapped[UUID | None] = mapped_column(ForeignKey("subtopics.id", ondelete="SET NULL"))
    reason: Mapped[str | None] = mapped_column(Text)
    decision_payload: Mapped[dict] = mapped_column(jsonb_type, default=dict, nullable=False)


class NavigationHistory(EntityMixin, Base):
    __tablename__ = "navigation_history"
    __table_args__ = (Index("ix_navigation_history_session_created", "learning_session_id", "created_at"),)

    learning_session_id: Mapped[UUID] = mapped_column(ForeignKey("learning_sessions.id", ondelete="CASCADE"), index=True)
    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    from_subtopic_id: Mapped[UUID | None] = mapped_column(ForeignKey("subtopics.id", ondelete="SET NULL"))
    to_subtopic_id: Mapped[UUID | None] = mapped_column(ForeignKey("subtopics.id", ondelete="SET NULL"))
    action: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    reason: Mapped[str | None] = mapped_column(Text)
    metadata_: Mapped[dict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)
