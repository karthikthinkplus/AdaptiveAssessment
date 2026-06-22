import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    subtopic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subtopics.id"), nullable=False
    )
    passage_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("question_passages.id")
    )
    question_code: Mapped[str | None] = mapped_column(String(100), unique=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), default="mcq", nullable=False)
    difficulty_level: Mapped[str] = mapped_column(String(50), nullable=False)
    difficulty_b: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    discrimination_a: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    guessing_c: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    correct_answer: Mapped[str | None] = mapped_column(Text)
    estimated_time_seconds: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
