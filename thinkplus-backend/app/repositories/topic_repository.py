from app.models.subtopic import Subtopic
from app.models.topic import Topic
from app.repositories.base import Repository


class TopicRepository(Repository[Topic]):
    model = Topic


class SubtopicRepository(Repository[Subtopic]):
    model = Subtopic
