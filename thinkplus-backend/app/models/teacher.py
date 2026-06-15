from uuid import UUID

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, EntityMixin, jsonb_type


class Teacher(EntityMixin, Base):
    __tablename__ = "teachers"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    external_id: Mapped[str | None] = mapped_column(String(120), unique=True)
    department: Mapped[str | None] = mapped_column(String(120), index=True)
    profile_metadata: Mapped[dict] = mapped_column(jsonb_type, default=dict, nullable=False)
