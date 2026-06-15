from uuid import UUID

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, EntityMixin, jsonb_type


class Student(EntityMixin, Base):
    __tablename__ = "students"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    external_id: Mapped[str | None] = mapped_column(String(120), unique=True)
    grade_level: Mapped[str | None] = mapped_column(String(32), index=True)
    enrollment_metadata: Mapped[dict] = mapped_column(jsonb_type, default=dict, nullable=False)
