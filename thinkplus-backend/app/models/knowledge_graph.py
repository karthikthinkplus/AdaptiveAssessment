from uuid import UUID

from sqlalchemy import Float, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, EntityMixin, jsonb_type


class TopicPrerequisite(EntityMixin, Base):
    __tablename__ = "topic_prerequisites"
    __table_args__ = (
        UniqueConstraint("topic_id", "prerequisite_topic_id", name="uq_topic_prerequisite"),
        Index("ix_topic_prerequisites_pair", "topic_id", "prerequisite_topic_id"),
    )

    topic_id: Mapped[UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    prerequisite_topic_id: Mapped[UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)


class SubtopicPrerequisite(EntityMixin, Base):
    __tablename__ = "subtopic_prerequisites"
    __table_args__ = (
        UniqueConstraint("subtopic_id", "prerequisite_subtopic_id", name="uq_subtopic_prerequisite"),
        Index("ix_subtopic_prerequisites_pair", "subtopic_id", "prerequisite_subtopic_id"),
    )

    subtopic_id: Mapped[UUID] = mapped_column(ForeignKey("subtopics.id", ondelete="CASCADE"), index=True)
    prerequisite_subtopic_id: Mapped[UUID] = mapped_column(ForeignKey("subtopics.id", ondelete="CASCADE"), index=True)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)
