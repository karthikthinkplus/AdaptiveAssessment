import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Doubt(Base):
    __tablename__ = "doubts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    doubt_key: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    image_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="unresolved", nullable=False, index=True)
    duplicate_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    explanation_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    explanation_link: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    explanation_image_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
