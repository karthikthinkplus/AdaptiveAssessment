import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class StudentBKTState(Base):
    __tablename__ = "student_bkt_states"
    __table_args__ = (UniqueConstraint("student_id", "subtopic_id", name="uq_student_subtopic_bkt"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    subtopic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subtopics.id", ondelete="CASCADE"), nullable=False
    )
    p_l0: Mapped[float] = mapped_column(Float, default=0.20, nullable=False)
    p_transit: Mapped[float] = mapped_column(Float, default=0.15, nullable=False)
    p_guess: Mapped[float] = mapped_column(Float, default=0.20, nullable=False)
    p_slip: Mapped[float] = mapped_column(Float, default=0.10, nullable=False)
    p_mastery: Mapped[float] = mapped_column(Float, default=0.20, nullable=False)
    mastery_status: Mapped[str] = mapped_column(String(50), default="not_started", nullable=False)
    attempts_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    correct_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_response_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_responses.id")
    )
    last_updated_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
