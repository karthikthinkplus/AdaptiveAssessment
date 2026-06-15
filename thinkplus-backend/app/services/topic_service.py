from sqlalchemy.orm import Session

from app.models.subtopic import Subtopic
from app.models.topic import Topic
from app.repositories.topic_repository import SubtopicRepository, TopicRepository
from app.schemas.topic_schema import SubtopicCreate, SubtopicRead, TopicCreate, TopicRead


class TopicService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.topics = TopicRepository(db)
        self.subtopics = SubtopicRepository(db)

    def create_topic(self, payload: TopicCreate) -> TopicRead:
        topic = self.topics.add(Topic(name=payload.name, description=payload.description, metadata_=payload.metadata))
        self.db.commit()
        self.db.refresh(topic)
        return TopicRead.model_validate(topic)

    def list_topics(self) -> list[TopicRead]:
        return [TopicRead.model_validate(topic) for topic in self.topics.list(limit=500)]

    def create_subtopic(self, payload: SubtopicCreate) -> SubtopicRead:
        subtopic = self.subtopics.add(Subtopic(**payload.model_dump()))
        self.db.commit()
        self.db.refresh(subtopic)
        return SubtopicRead.model_validate(subtopic)
