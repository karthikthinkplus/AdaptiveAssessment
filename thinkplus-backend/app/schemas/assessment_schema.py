from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.role import AssessmentStatus, AttemptStatus


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class AssessmentCreate(BaseModel):
    title: str
    topic_id: UUID | None = None
    status: AssessmentStatus = AssessmentStatus.draft
    config: dict = {}


class AssessmentRead(ORMModel):
    id: UUID
    title: str
    topic_id: UUID | None
    status: AssessmentStatus


class AssessmentAttemptCreate(BaseModel):
    assessment_id: UUID
    student_id: UUID


class AssessmentAttemptRead(ORMModel):
    id: UUID
    assessment_id: UUID
    student_id: UUID
    status: AttemptStatus
