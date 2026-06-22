from uuid import UUID

from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.models.knowledge_graph import KnowledgeGraphEdge
from app.models.subtopic import Subtopic
from app.models.topic import Topic


class TopicRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_topics(self) -> list[Topic]:
        return list(self.db.execute(select(Topic).order_by(Topic.display_order, Topic.name)).scalars().all())

    def get_topic(self, topic_id: UUID) -> Topic | None:
        return self.db.get(Topic, topic_id)

    def get_topic_by_name(self, name: str) -> Topic | None:
        return self.db.execute(select(Topic).where(Topic.name == name)).scalar_one_or_none()

    def create_topic(self, topic: Topic) -> Topic:
        self.db.add(topic)
        self.db.flush()
        self.db.refresh(topic)
        return topic

    def list_subtopics(self, topic_id: UUID) -> list[Subtopic]:
        stmt = select(Subtopic).where(Subtopic.topic_id == topic_id).order_by(Subtopic.display_order, Subtopic.name)
        return list(self.db.execute(stmt).scalars().all())

    def get_subtopic(self, subtopic_id: UUID) -> Subtopic | None:
        return self.db.get(Subtopic, subtopic_id)

    def get_subtopic_by_name(self, topic_id: UUID, name: str) -> Subtopic | None:
        stmt = select(Subtopic).where(and_(Subtopic.topic_id == topic_id, Subtopic.name == name))
        return self.db.execute(stmt).scalar_one_or_none()

    def create_subtopic(self, subtopic: Subtopic) -> Subtopic:
        self.db.add(subtopic)
        self.db.flush()
        self.db.refresh(subtopic)
        return subtopic

    def list_prerequisites(self, subtopic_id: UUID) -> list[KnowledgeGraphEdge]:
        stmt = select(KnowledgeGraphEdge).where(
            and_(
                KnowledgeGraphEdge.target_subtopic_id == subtopic_id,
                KnowledgeGraphEdge.is_active.is_(True),
            )
        )
        return list(self.db.execute(stmt).scalars().all())

    def list_next_edges(self, subtopic_id: UUID) -> list[KnowledgeGraphEdge]:
        stmt = select(KnowledgeGraphEdge).where(
            and_(
                KnowledgeGraphEdge.source_subtopic_id == subtopic_id,
                KnowledgeGraphEdge.is_active.is_(True),
            )
        )
        return list(self.db.execute(stmt).scalars().all())

    def list_topic_related_subtopics(self, topic_id: UUID) -> list[Subtopic]:
        stmt = select(Subtopic).where(Subtopic.topic_id == topic_id).order_by(Subtopic.display_order, Subtopic.name)
        return list(self.db.execute(stmt).scalars().all())
