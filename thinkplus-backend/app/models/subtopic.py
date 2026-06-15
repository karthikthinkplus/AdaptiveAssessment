from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, EntityMixin, jsonb_type

if TYPE_CHECKING:
    from app.models.topic import Topic


class Subtopic(EntityMixin, Base):
    __tablename__ = "subtopics"
    __table_args__ = (UniqueConstraint("topic_id", "name", name="uq_subtopics_topic_name"),)

    topic_id: Mapped[UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    sequence_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)

    topic: Mapped[Topic] = relationship(back_populates="subtopics")
