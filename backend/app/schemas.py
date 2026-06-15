from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import (
    AssessmentStatus,
    AttemptStatus,
    DecisionType,
    QuestionType,
    SessionStatus,
    UserRole,
)


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class EntityRead(ORMModel):
    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None


class TokenRead(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)
    full_name: str = Field(min_length=1, max_length=200)
    role: UserRole = UserRole.student
    profile: dict = Field(default_factory=dict)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserRead(EntityRead):
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    metadata_: dict = Field(validation_alias="metadata_", serialization_alias="metadata")


class AuthRead(BaseModel):
    user: UserRead
    token: TokenRead


class StudentCreate(BaseModel):
    user_id: UUID
    external_id: str | None = None
    grade_level: str | None = None
    enrollment_metadata: dict = Field(default_factory=dict)


class StudentRead(EntityRead):
    user_id: UUID
    external_id: str | None
    grade_level: str | None
    enrollment_metadata: dict


class TeacherCreate(BaseModel):
    user_id: UUID
    external_id: str | None = None
    department: str | None = None
    profile_metadata: dict = Field(default_factory=dict)


class TeacherRead(EntityRead):
    user_id: UUID
    external_id: str | None
    department: str | None
    profile_metadata: dict


class TopicCreate(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    description: str | None = None
    metadata: dict = Field(default_factory=dict)


class TopicRead(EntityRead):
    name: str
    description: str | None
    metadata_: dict = Field(validation_alias="metadata_", serialization_alias="metadata")


class SubtopicCreate(BaseModel):
    topic_id: UUID
    name: str = Field(min_length=1, max_length=180)
    description: str | None = None
    sequence_order: int = 0
    metadata: dict = Field(default_factory=dict)


class SubtopicRead(EntityRead):
    topic_id: UUID
    name: str
    description: str | None
    sequence_order: int
    metadata_: dict = Field(validation_alias="metadata_", serialization_alias="metadata")


class PrerequisiteCreate(BaseModel):
    prerequisite_id: UUID
    weight: float = Field(default=1.0, ge=0.0)
    metadata: dict = Field(default_factory=dict)


class QuestionOptionCreate(BaseModel):
    option_key: str = Field(min_length=1, max_length=16)
    option_text: str
    is_correct: bool = False
    sequence_order: int = 0
    metadata: dict = Field(default_factory=dict)


class QuestionOptionRead(EntityRead):
    question_id: UUID
    option_key: str
    option_text: str
    is_correct: bool
    sequence_order: int
    metadata_: dict = Field(validation_alias="metadata_", serialization_alias="metadata")


class QuestionCreate(BaseModel):
    subtopic_id: UUID
    question_type: QuestionType = QuestionType.multiple_choice
    prompt: str
    correct_answer: str | None = None
    difficulty_b: float = Field(default=0.0, ge=-6.0, le=6.0)
    is_active: bool = True
    metadata: dict = Field(default_factory=dict)
    options: list[QuestionOptionCreate] = Field(default_factory=list)


class QuestionRead(EntityRead):
    subtopic_id: UUID
    created_by_user_id: UUID | None
    question_type: QuestionType
    prompt: str
    correct_answer: str | None
    difficulty_b: float
    is_active: bool
    metadata_: dict = Field(validation_alias="metadata_", serialization_alias="metadata")
    options: list[QuestionOptionRead] = Field(default_factory=list)


class AssessmentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=220)
    topic_id: UUID | None = None
    status: AssessmentStatus = AssessmentStatus.draft
    config: dict = Field(default_factory=dict)
    question_ids: list[UUID] = Field(default_factory=list)


class AssessmentRead(EntityRead):
    title: str
    topic_id: UUID | None
    created_by_user_id: UUID | None
    status: AssessmentStatus
    config: dict


class AssessmentAttemptCreate(BaseModel):
    assessment_id: UUID
    student_id: UUID
    metadata: dict = Field(default_factory=dict)


class AssessmentAttemptRead(EntityRead):
    assessment_id: UUID
    student_id: UUID
    status: AttemptStatus
    started_at: datetime
    completed_at: datetime | None
    score: float | None
    metadata_: dict = Field(validation_alias="metadata_", serialization_alias="metadata")


class LearningSessionCreate(BaseModel):
    student_id: UUID
    topic_id: UUID
    current_subtopic_id: UUID | None = None
    metadata: dict = Field(default_factory=dict)


class LearningSessionRead(EntityRead):
    student_id: UUID
    topic_id: UUID
    current_subtopic_id: UUID | None
    status: SessionStatus
    started_at: datetime
    ended_at: datetime | None
    metadata_: dict = Field(validation_alias="metadata_", serialization_alias="metadata")


class ResponseCreate(BaseModel):
    question_id: UUID
    selected_option_id: UUID | None = None
    answer_text: str | None = None
    response_time_ms: int | None = Field(default=None, ge=0)
    assessment_attempt_id: UUID | None = None
    metadata: dict = Field(default_factory=dict)


class StudentResponseRead(EntityRead):
    student_id: UUID
    learning_session_id: UUID | None
    assessment_attempt_id: UUID | None
    question_id: UUID
    selected_option_id: UUID | None
    answer_text: str | None
    is_correct: bool
    response_time_ms: int | None
    metadata_: dict = Field(validation_alias="metadata_", serialization_alias="metadata")


class BKTStateRead(EntityRead):
    student_id: UUID
    subtopic_id: UUID
    mastery_probability: float
    attempts: int
    correct_count: int
    parameters: dict


class ThetaRead(EntityRead):
    student_id: UUID
    topic_id: UUID
    theta: float
    standard_error: float
    posterior: dict


class AdaptiveNextQuestionRequest(BaseModel):
    learning_session_id: UUID


class AdaptiveDecisionRead(EntityRead):
    learning_session_id: UUID
    student_id: UUID
    decision_type: DecisionType
    selected_question_id: UUID | None
    from_subtopic_id: UUID | None
    to_subtopic_id: UUID | None
    reason: str | None
    decision_payload: dict


class AdaptiveNextQuestionRead(BaseModel):
    decision: AdaptiveDecisionRead
    question: QuestionRead | None


class AnalyticsSummary(BaseModel):
    users: int
    students: int
    teachers: int
    topics: int
    questions: int
    assessments: int
    learning_sessions: int
    responses: int


class StudentAnalytics(BaseModel):
    student_id: UUID
    responses: int
    correct_responses: int
    average_mastery: float
    average_theta: float
