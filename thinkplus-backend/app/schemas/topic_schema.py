from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TopicCreate(BaseModel):
    name: str
    description: str | None = None
    metadata: dict = {}


class TopicRead(ORMModel):
    id: UUID
    name: str
    description: str | None


class SubtopicCreate(BaseModel):
    topic_id: UUID
    name: str
    description: str | None = None
    sequence_order: int = 0


class SubtopicRead(ORMModel):
    id: UUID
    topic_id: UUID
    name: str
    description: str | None
    sequence_order: int
