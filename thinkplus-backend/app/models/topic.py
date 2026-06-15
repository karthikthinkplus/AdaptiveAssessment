from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, EntityMixin, jsonb_type

if TYPE_CHECKING:
    from app.models.subtopic import Subtopic


class Topic(EntityMixin, Base):
    __tablename__ = "topics"

    name: Mapped[str] = mapped_column(String(180), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    metadata_: Mapped[dict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)

    subtopics: Mapped[list[Subtopic]] = relationship(back_populates="topic", cascade="all, delete-orphan")
