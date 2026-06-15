from uuid import UUID

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, EntityMixin, jsonb_type
from app.models.role import QuestionType


class Question(EntityMixin, Base):
    __tablename__ = "questions"
    __table_args__ = (Index("ix_questions_subtopic_active_difficulty", "subtopic_id", "is_active", "difficulty_b"),)

    subtopic_id: Mapped[UUID] = mapped_column(ForeignKey("subtopics.id", ondelete="CASCADE"), index=True)
    created_by_user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    question_type: Mapped[QuestionType] = mapped_column(Enum(QuestionType, native_enum=False), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    correct_answer: Mapped[str | None] = mapped_column(Text)
    difficulty_b: Mapped[float] = mapped_column(Float, default=0.0, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)

    options: Mapped[list["QuestionOption"]] = relationship(back_populates="question", cascade="all, delete-orphan")


class QuestionOption(EntityMixin, Base):
    __tablename__ = "question_options"
    __table_args__ = (UniqueConstraint("question_id", "option_key", name="uq_question_options_key"),)

    question_id: Mapped[UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    option_key: Mapped[str] = mapped_column(String(16), nullable=False)
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sequence_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)

    question: Mapped[Question] = relationship(back_populates="options")


class QuestionVersion(EntityMixin, Base):
    __tablename__ = "question_versions"
    __table_args__ = (UniqueConstraint("question_id", "version_number", name="uq_question_versions_number"),)

    question_id: Mapped[UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot: Mapped[dict] = mapped_column(jsonb_type, nullable=False)
    change_reason: Mapped[str | None] = mapped_column(Text)
    created_by_user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
