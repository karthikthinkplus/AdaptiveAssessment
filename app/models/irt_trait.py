import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class StudentIRTTrait(Base):
    __tablename__ = "student_irt_traits"
    __table_args__ = (UniqueConstraint("student_id", "topic_id", name="uq_student_topic_irt"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    topic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False
    )
    theta: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    theta_variance: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    standard_error: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    estimation_method: Mapped[str] = mapped_column(String(50), default="EAP", nullable=False)
    valid_response_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_response_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_responses.id")
    )
    last_updated_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
