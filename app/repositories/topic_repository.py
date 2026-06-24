from uuid import UUID

from sqlalchemy import and_, or_, select, func
from sqlalchemy.orm import Session

from app.models.knowledge_graph import KnowledgeGraphEdge
from app.models.learning_session import LearningSession
from app.models.question import Question
from app.models.subtopic import Subtopic
from app.models.topic import Topic


class TopicRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_topics(self) -> list[Topic]:
        q_sub = (
            select(func.count(Question.id))
            .where(Question.topic_id == Topic.id)
            .scalar_subquery()
        )
        active_sub = (
            select(func.count(LearningSession.id))
            .where(
                and_(
                    LearningSession.topic_id == Topic.id,
                    LearningSession.status == "active",
                )
            )
            .scalar_subquery()
        )
        completed_sub = (
            select(func.count(LearningSession.id))
            .where(
                and_(
                    LearningSession.topic_id == Topic.id,
                    LearningSession.status == "completed",
                )
            )
            .scalar_subquery()
        )

        stmt = select(
            Topic,
            q_sub.label("question_count"),
            active_sub.label("active_sessions"),
            completed_sub.label("completed_sessions"),
        ).order_by(Topic.display_order, Topic.name)

        results = self.db.execute(stmt).all()
        topics_with_stats = []
        for topic, q_cnt, act_cnt, comp_cnt in results:
            topic.question_count = q_cnt or 0
            topic.active_sessions = act_cnt or 0
            topic.completed_sessions = comp_cnt or 0
            topics_with_stats.append(topic)
        return topics_with_stats

    def get_topic(self, topic_id: UUID) -> Topic | None:
        q_sub = (
            select(func.count(Question.id))
            .where(Question.topic_id == Topic.id)
            .scalar_subquery()
        )
        active_sub = (
            select(func.count(LearningSession.id))
            .where(
                and_(
                    LearningSession.topic_id == Topic.id,
                    LearningSession.status == "active",
                )
            )
            .scalar_subquery()
        )
        completed_sub = (
            select(func.count(LearningSession.id))
            .where(
                and_(
                    LearningSession.topic_id == Topic.id,
                    LearningSession.status == "completed",
                )
            )
            .scalar_subquery()
        )

        stmt = select(
            Topic,
            q_sub.label("question_count"),
            active_sub.label("active_sessions"),
            completed_sub.label("completed_sessions"),
        ).where(Topic.id == topic_id)

        result = self.db.execute(stmt).first()
        if not result:
            return None
        topic, q_cnt, act_cnt, comp_cnt = result
        topic.question_count = q_cnt or 0
        topic.active_sessions = act_cnt or 0
        topic.completed_sessions = comp_cnt or 0
        return topic

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
