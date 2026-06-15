from datetime import UTC, datetime
from enum import StrEnum
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON, Uuid

from app.shared.db.base import Base

JsonDict = dict
jsonb_type = JSON().with_variant(JSONB, "postgresql")
inet_type = String(64).with_variant(INET, "postgresql")


class UserRole(StrEnum):
    student = "student"
    teacher = "teacher"
    admin = "admin"


class AssessmentStatus(StrEnum):
    draft = "draft"
    active = "active"
    completed = "completed"
    archived = "archived"


class AttemptStatus(StrEnum):
    in_progress = "in_progress"
    completed = "completed"
    abandoned = "abandoned"


class QuestionType(StrEnum):
    multiple_choice = "multiple_choice"
    numeric = "numeric"
    text = "text"


class SessionStatus(StrEnum):
    active = "active"
    completed = "completed"
    abandoned = "abandoned"


class DecisionType(StrEnum):
    start = "start"
    next_question = "next_question"
    progress = "progress"
    backtrack = "backtrack"
    complete = "complete"


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )


class SoftDeleteMixin:
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)


class EntityMixin(TimestampMixin, SoftDeleteMixin):
    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)


class User(EntityMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, native_enum=False), index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    metadata_: Mapped[JsonDict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)

    sessions: Mapped[list["UserSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    student: Mapped["Student | None"] = relationship(back_populates="user", uselist=False)
    teacher: Mapped["Teacher | None"] = relationship(back_populates="user", uselist=False)


class UserSession(EntityMixin, Base):
    __tablename__ = "user_sessions"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token_jti: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    refresh_token_hash: Mapped[str | None] = mapped_column(String(255))
    ip_address: Mapped[str | None] = mapped_column(inet_type)
    user_agent: Mapped[str | None] = mapped_column(Text)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="sessions")


class AuditLog(EntityMixin, Base):
    __tablename__ = "audit_logs"

    actor_user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    action: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    entity_type: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    entity_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True), index=True)
    before: Mapped[JsonDict | None] = mapped_column(jsonb_type)
    after: Mapped[JsonDict | None] = mapped_column(jsonb_type)
    request_metadata: Mapped[JsonDict] = mapped_column(jsonb_type, default=dict, nullable=False)


class Student(EntityMixin, Base):
    __tablename__ = "students"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    external_id: Mapped[str | None] = mapped_column(String(120), unique=True)
    grade_level: Mapped[str | None] = mapped_column(String(32), index=True)
    enrollment_metadata: Mapped[JsonDict] = mapped_column(jsonb_type, default=dict, nullable=False)

    user: Mapped[User] = relationship(back_populates="student")
    responses: Mapped[list["StudentResponse"]] = relationship(back_populates="student")


class Teacher(EntityMixin, Base):
    __tablename__ = "teachers"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    external_id: Mapped[str | None] = mapped_column(String(120), unique=True)
    department: Mapped[str | None] = mapped_column(String(120), index=True)
    profile_metadata: Mapped[JsonDict] = mapped_column(jsonb_type, default=dict, nullable=False)

    user: Mapped[User] = relationship(back_populates="teacher")


class Topic(EntityMixin, Base):
    __tablename__ = "topics"

    name: Mapped[str] = mapped_column(String(180), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    metadata_: Mapped[JsonDict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)

    subtopics: Mapped[list["Subtopic"]] = relationship(back_populates="topic", cascade="all, delete-orphan")


class Subtopic(EntityMixin, Base):
    __tablename__ = "subtopics"
    __table_args__ = (UniqueConstraint("topic_id", "name", name="uq_subtopics_topic_name"),)

    topic_id: Mapped[UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    sequence_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    metadata_: Mapped[JsonDict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)

    topic: Mapped[Topic] = relationship(back_populates="subtopics")
    questions: Mapped[list["Question"]] = relationship(back_populates="subtopic")


class TopicPrerequisite(EntityMixin, Base):
    __tablename__ = "topic_prerequisites"
    __table_args__ = (
        UniqueConstraint("topic_id", "prerequisite_topic_id", name="uq_topic_prerequisite"),
        Index("ix_topic_prerequisites_pair", "topic_id", "prerequisite_topic_id"),
    )

    topic_id: Mapped[UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    prerequisite_topic_id: Mapped[UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    metadata_: Mapped[JsonDict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)


class SubtopicPrerequisite(EntityMixin, Base):
    __tablename__ = "subtopic_prerequisites"
    __table_args__ = (
        UniqueConstraint("subtopic_id", "prerequisite_subtopic_id", name="uq_subtopic_prerequisite"),
        Index("ix_subtopic_prerequisites_pair", "subtopic_id", "prerequisite_subtopic_id"),
    )

    subtopic_id: Mapped[UUID] = mapped_column(ForeignKey("subtopics.id", ondelete="CASCADE"), index=True)
    prerequisite_subtopic_id: Mapped[UUID] = mapped_column(ForeignKey("subtopics.id", ondelete="CASCADE"), index=True)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    metadata_: Mapped[JsonDict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)


class Question(EntityMixin, Base):
    __tablename__ = "questions"
    __table_args__ = (Index("ix_questions_subtopic_active_difficulty", "subtopic_id", "is_active", "difficulty_b"),)

    subtopic_id: Mapped[UUID] = mapped_column(ForeignKey("subtopics.id", ondelete="CASCADE"), index=True)
    created_by_user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    question_type: Mapped[QuestionType] = mapped_column(Enum(QuestionType, native_enum=False), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    correct_answer: Mapped[str | None] = mapped_column(Text)
    difficulty_b: Mapped[float] = mapped_column(Float, default=0.0, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
    metadata_: Mapped[JsonDict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)

    subtopic: Mapped[Subtopic] = relationship(back_populates="questions")
    options: Mapped[list["QuestionOption"]] = relationship(back_populates="question", cascade="all, delete-orphan")
    versions: Mapped[list["QuestionVersion"]] = relationship(back_populates="question", cascade="all, delete-orphan")


class QuestionOption(EntityMixin, Base):
    __tablename__ = "question_options"
    __table_args__ = (UniqueConstraint("question_id", "option_key", name="uq_question_options_key"),)

    question_id: Mapped[UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    option_key: Mapped[str] = mapped_column(String(16), nullable=False)
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sequence_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    metadata_: Mapped[JsonDict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)

    question: Mapped[Question] = relationship(back_populates="options")


class QuestionVersion(EntityMixin, Base):
    __tablename__ = "question_versions"
    __table_args__ = (UniqueConstraint("question_id", "version_number", name="uq_question_versions_number"),)

    question_id: Mapped[UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot: Mapped[JsonDict] = mapped_column(jsonb_type, nullable=False)
    change_reason: Mapped[str | None] = mapped_column(Text)
    created_by_user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    question: Mapped[Question] = relationship(back_populates="versions")


class Assessment(EntityMixin, Base):
    __tablename__ = "assessments"

    title: Mapped[str] = mapped_column(String(220), index=True, nullable=False)
    topic_id: Mapped[UUID | None] = mapped_column(ForeignKey("topics.id", ondelete="SET NULL"), index=True)
    created_by_user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    status: Mapped[AssessmentStatus] = mapped_column(Enum(AssessmentStatus, native_enum=False), index=True)
    config: Mapped[JsonDict] = mapped_column(jsonb_type, default=dict, nullable=False)


class AssessmentQuestion(EntityMixin, Base):
    __tablename__ = "assessment_questions"
    __table_args__ = (
        UniqueConstraint("assessment_id", "question_id", name="uq_assessment_question"),
        Index("ix_assessment_questions_order", "assessment_id", "sequence_order"),
    )

    assessment_id: Mapped[UUID] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    sequence_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    metadata_: Mapped[JsonDict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)


class AssessmentAttempt(EntityMixin, Base):
    __tablename__ = "assessment_attempts"
    __table_args__ = (Index("ix_assessment_attempts_student_status", "student_id", "status"),)

    assessment_id: Mapped[UUID] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), index=True)
    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    status: Mapped[AttemptStatus] = mapped_column(Enum(AttemptStatus, native_enum=False), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    score: Mapped[float | None] = mapped_column(Float)
    metadata_: Mapped[JsonDict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)


class LearningSession(EntityMixin, Base):
    __tablename__ = "learning_sessions"
    __table_args__ = (Index("ix_learning_sessions_student_status", "student_id", "status"),)

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    topic_id: Mapped[UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    current_subtopic_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("subtopics.id", ondelete="SET NULL"),
        index=True,
    )
    status: Mapped[SessionStatus] = mapped_column(Enum(SessionStatus, native_enum=False), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    metadata_: Mapped[JsonDict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)


class StudentResponse(EntityMixin, Base):
    __tablename__ = "student_responses"
    __table_args__ = (
        Index("ix_student_responses_student_question", "student_id", "question_id"),
        Index("ix_student_responses_session_created", "learning_session_id", "created_at"),
    )

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    learning_session_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("learning_sessions.id", ondelete="CASCADE"),
        index=True,
    )
    assessment_attempt_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("assessment_attempts.id", ondelete="CASCADE"),
        index=True,
    )
    question_id: Mapped[UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    selected_option_id: Mapped[UUID | None] = mapped_column(ForeignKey("question_options.id", ondelete="SET NULL"))
    answer_text: Mapped[str | None] = mapped_column(Text)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    response_time_ms: Mapped[int | None] = mapped_column(Integer)
    metadata_: Mapped[JsonDict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)

    student: Mapped[Student] = relationship(back_populates="responses")


class StudentBKTState(EntityMixin, Base):
    __tablename__ = "student_bkt_states"
    __table_args__ = (UniqueConstraint("student_id", "subtopic_id", name="uq_student_bkt_state"),)

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    subtopic_id: Mapped[UUID] = mapped_column(ForeignKey("subtopics.id", ondelete="CASCADE"), index=True)
    mastery_probability: Mapped[float] = mapped_column(Float, default=0.2, nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    correct_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    parameters: Mapped[JsonDict] = mapped_column(jsonb_type, default=dict, nullable=False)


class BKTHistory(EntityMixin, Base):
    __tablename__ = "bkt_history"
    __table_args__ = (Index("ix_bkt_history_student_subtopic_created", "student_id", "subtopic_id", "created_at"),)

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    subtopic_id: Mapped[UUID] = mapped_column(ForeignKey("subtopics.id", ondelete="CASCADE"), index=True)
    response_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("student_responses.id", ondelete="SET NULL"),
        index=True,
    )
    prior_probability: Mapped[float] = mapped_column(Float, nullable=False)
    posterior_probability: Mapped[float] = mapped_column(Float, nullable=False)
    parameters: Mapped[JsonDict] = mapped_column(jsonb_type, nullable=False)


class StudentTopicTheta(EntityMixin, Base):
    __tablename__ = "student_topic_theta"
    __table_args__ = (UniqueConstraint("student_id", "topic_id", name="uq_student_topic_theta"),)

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    topic_id: Mapped[UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    theta: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    standard_error: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    posterior: Mapped[JsonDict] = mapped_column(jsonb_type, default=dict, nullable=False)


class ThetaHistory(EntityMixin, Base):
    __tablename__ = "theta_history"
    __table_args__ = (Index("ix_theta_history_student_topic_created", "student_id", "topic_id", "created_at"),)

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    topic_id: Mapped[UUID] = mapped_column(ForeignKey("topics.id", ondelete="CASCADE"), index=True)
    response_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("student_responses.id", ondelete="SET NULL"),
        index=True,
    )
    theta_before: Mapped[float] = mapped_column(Float, nullable=False)
    theta_after: Mapped[float] = mapped_column(Float, nullable=False)
    standard_error: Mapped[float] = mapped_column(Float, nullable=False)
    posterior: Mapped[JsonDict] = mapped_column(jsonb_type, nullable=False)


class AdaptiveDecision(EntityMixin, Base):
    __tablename__ = "adaptive_decisions"
    __table_args__ = (Index("ix_adaptive_decisions_session_created", "learning_session_id", "created_at"),)

    learning_session_id: Mapped[UUID] = mapped_column(
        ForeignKey("learning_sessions.id", ondelete="CASCADE"),
        index=True,
    )
    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    decision_type: Mapped[DecisionType] = mapped_column(Enum(DecisionType, native_enum=False), index=True)
    selected_question_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("questions.id", ondelete="SET NULL"),
        index=True,
    )
    from_subtopic_id: Mapped[UUID | None] = mapped_column(ForeignKey("subtopics.id", ondelete="SET NULL"))
    to_subtopic_id: Mapped[UUID | None] = mapped_column(ForeignKey("subtopics.id", ondelete="SET NULL"))
    reason: Mapped[str | None] = mapped_column(Text)
    decision_payload: Mapped[JsonDict] = mapped_column(jsonb_type, default=dict, nullable=False)


class NavigationHistory(EntityMixin, Base):
    __tablename__ = "navigation_history"
    __table_args__ = (Index("ix_navigation_history_session_created", "learning_session_id", "created_at"),)

    learning_session_id: Mapped[UUID] = mapped_column(
        ForeignKey("learning_sessions.id", ondelete="CASCADE"),
        index=True,
    )
    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    from_subtopic_id: Mapped[UUID | None] = mapped_column(ForeignKey("subtopics.id", ondelete="SET NULL"))
    to_subtopic_id: Mapped[UUID | None] = mapped_column(ForeignKey("subtopics.id", ondelete="SET NULL"))
    action: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    reason: Mapped[str | None] = mapped_column(Text)
    metadata_: Mapped[JsonDict] = mapped_column("metadata", jsonb_type, default=dict, nullable=False)


class StudentDailySummary(EntityMixin, Base):
    __tablename__ = "student_daily_summary"
    __table_args__ = (
        UniqueConstraint("student_id", "summary_date", name="uq_student_daily_summary"),
        Index("ix_student_daily_summary_date", "summary_date"),
    )

    student_id: Mapped[UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True)
    summary_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    sessions_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    questions_answered: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    correct_answers: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_theta: Mapped[float | None] = mapped_column(Float)
    average_mastery: Mapped[float | None] = mapped_column(Float)
    summary_payload: Mapped[JsonDict] = mapped_column(jsonb_type, default=dict, nullable=False)
