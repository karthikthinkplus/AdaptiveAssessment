from uuid import UUID

from sqlalchemy.orm import Session

from app.exceptions import AppException
from app.models.subtopic import Subtopic
from app.models.topic import Topic
from app.repositories.topic_repository import TopicRepository
from app.schemas.subtopic_schema import SubtopicCreate, SubtopicUpdate
from app.schemas.topic_schema import TopicCreate, TopicUpdate


class TopicService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = TopicRepository(db)

    def list_topics(self) -> list[Topic]:
        return self.repo.list_topics()

    def get_topic(self, topic_id: UUID) -> Topic:
        topic = self.repo.get_topic(topic_id)
        if not topic:
            raise AppException("Topic not found", "TOPIC_NOT_FOUND", 404)
        return topic

    def create_topic(self, payload: TopicCreate, created_by: UUID | None = None) -> Topic:
        topic = Topic(**payload.model_dump(), created_by=created_by)
        self.repo.create_topic(topic)
        self.db.commit()
        return topic

    def update_topic(self, topic_id: UUID, payload: TopicUpdate) -> Topic:
        topic = self.get_topic(topic_id)
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(topic, key, value)
        self.db.commit()
        self.db.refresh(topic)
        return topic

    def list_subtopics(self, topic_id: UUID) -> list[Subtopic]:
        self.get_topic(topic_id)
        return self.repo.list_subtopics(topic_id)

    def create_subtopic(self, topic_id: UUID, payload: SubtopicCreate) -> Subtopic:
        self.get_topic(topic_id)
        existing = self.repo.get_subtopic_by_name(topic_id, payload.name)
        if existing:
            raise AppException("Subtopic already exists", "SUBTOPIC_ALREADY_EXISTS", 409)
        subtopic = Subtopic(topic_id=topic_id, **payload.model_dump())
        self.repo.create_subtopic(subtopic)
        self.db.commit()
        return subtopic

    def update_subtopic(self, subtopic_id: UUID, payload: SubtopicUpdate) -> Subtopic:
        subtopic = self.repo.get_subtopic(subtopic_id)
        if not subtopic:
            raise AppException("Subtopic not found", "SUBTOPIC_NOT_FOUND", 404)
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(subtopic, key, value)
        self.db.commit()
        self.db.refresh(subtopic)
        return subtopic
