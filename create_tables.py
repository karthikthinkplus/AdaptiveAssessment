
import os
import uuid
from datetime import datetime

from dotenv import load_dotenv
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    create_engine,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing. Please add DATABASE_URL in your .env file.")

engine = create_engine(DATABASE_URL, echo=True)

Base = declarative_base()


class Avatar(Base):
    __tablename__ = "avatars"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    avatar_type = Column(String(20), nullable=False)
    image_url = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=True)
    institution_name = Column(String(255), nullable=True)
    avatar_id = Column(UUID(as_uuid=True), ForeignKey("avatars.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="uq_user_role"),
    )


class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_code = Column(String(100), unique=True, nullable=False)
    grade = Column(String(100), nullable=True)
    batch_name = Column(String(100), nullable=True)
    current_status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    teacher_code = Column(String(100), unique=True, nullable=False)
    department = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Topic(Base):
    __tablename__ = "topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    difficulty_level = Column(String(50), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("name", name="uq_topic_name"),
    )


class Subtopic(Base):
    __tablename__ = "subtopics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    difficulty_level = Column(String(50), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    mastery_threshold = Column(Float, default=0.95, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("topic_id", "name", name="uq_topic_subtopic_name"),
    )


class KnowledgeGraphEdge(Base):
    __tablename__ = "knowledge_graph_edges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_subtopic_id = Column(UUID(as_uuid=True), ForeignKey("subtopics.id", ondelete="CASCADE"), nullable=False)
    target_subtopic_id = Column(UUID(as_uuid=True), ForeignKey("subtopics.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(50), default="prerequisite", nullable=False)
    weight = Column(Float, default=1.0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "source_subtopic_id",
            "target_subtopic_id",
            "relationship_type",
            name="uq_knowledge_graph_edge",
        ),
    )


class QuestionPassage(Base):
    __tablename__ = "question_passages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    passage_code = Column(String(100), unique=True, nullable=False)
    title = Column(String(255), nullable=True)
    passage_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    subtopic_id = Column(UUID(as_uuid=True), ForeignKey("subtopics.id"), nullable=False)
    passage_id = Column(UUID(as_uuid=True), ForeignKey("question_passages.id"), nullable=True)
    question_code = Column(String(100), unique=True, nullable=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="mcq", nullable=False)
    difficulty_level = Column(String(50), nullable=False)
    difficulty_b = Column(Float, default=0.0, nullable=False)
    discrimination_a = Column(Float, default=1.0, nullable=False)
    guessing_c = Column(Float, default=0.0, nullable=False)
    correct_answer = Column(Text, nullable=True)
    estimated_time_seconds = Column(Integer, nullable=True)
    status = Column(String(50), default="draft", nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    option_label = Column(String(10), nullable=False)
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("question_id", "option_label", name="uq_question_option_label"),
    )


class LearningSession(Base):
    __tablename__ = "learning_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    current_subtopic_id = Column(UUID(as_uuid=True), ForeignKey("subtopics.id"), nullable=True)
    session_type = Column(String(50), default="learning", nullable=False)
    status = Column(String(50), default="active", nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    total_questions_attempted = Column(Integer, default=0, nullable=False)
    total_correct = Column(Integer, default=0, nullable=False)
    total_time_seconds = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class StudentResponse(Base):
    __tablename__ = "student_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey("learning_sessions.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    subtopic_id = Column(UUID(as_uuid=True), ForeignKey("subtopics.id"), nullable=False)
    selected_option_id = Column(UUID(as_uuid=True), ForeignKey("question_options.id"), nullable=True)
    submitted_answer = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=False)
    response_time_seconds = Column(Float, nullable=False)
    event_type = Column(String(50), default="valid", nullable=False)
    attempt_number = Column(Integer, default=1, nullable=False)
    answered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class StudentBKTState(Base):
    __tablename__ = "student_bkt_states"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    subtopic_id = Column(UUID(as_uuid=True), ForeignKey("subtopics.id", ondelete="CASCADE"), nullable=False)
    p_l0 = Column(Float, default=0.20, nullable=False)
    p_transit = Column(Float, default=0.15, nullable=False)
    p_guess = Column(Float, default=0.20, nullable=False)
    p_slip = Column(Float, default=0.10, nullable=False)
    p_mastery = Column(Float, default=0.20, nullable=False)
    mastery_status = Column(String(50), default="not_started", nullable=False)
    attempts_count = Column(Integer, default=0, nullable=False)
    correct_count = Column(Integer, default=0, nullable=False)
    last_response_id = Column(UUID(as_uuid=True), ForeignKey("student_responses.id"), nullable=True)
    last_updated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("student_id", "subtopic_id", name="uq_student_subtopic_bkt"),
    )


class StudentIRTTrait(Base):
    __tablename__ = "student_irt_traits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    theta = Column(Float, default=0.0, nullable=False)
    theta_variance = Column(Float, default=1.0, nullable=False)
    standard_error = Column(Float, default=1.0, nullable=False)
    estimation_method = Column(String(50), default="EAP", nullable=False)
    valid_response_count = Column(Integer, default=0, nullable=False)
    last_response_id = Column(UUID(as_uuid=True), ForeignKey("student_responses.id"), nullable=True)
    last_updated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("student_id", "topic_id", name="uq_student_topic_irt"),
    )


class AdaptiveDecisionLog(Base):
    __tablename__ = "adaptive_decision_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(UUID(as_uuid=True), ForeignKey("learning_sessions.id", ondelete="CASCADE"), nullable=False)
    response_id = Column(UUID(as_uuid=True), ForeignKey("student_responses.id"), nullable=True)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    from_subtopic_id = Column(UUID(as_uuid=True), ForeignKey("subtopics.id"), nullable=True)
    to_subtopic_id = Column(UUID(as_uuid=True), ForeignKey("subtopics.id"), nullable=True)
    previous_mastery = Column(Float, nullable=True)
    updated_mastery = Column(Float, nullable=True)
    previous_theta = Column(Float, nullable=True)
    updated_theta = Column(Float, nullable=True)
    navigation_action = Column(String(50), nullable=False)
    difficulty_gate = Column(String(50), nullable=True)
    candidate_pool_size = Column(Integer, default=0, nullable=False)
    selected_question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=True)
    selection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


def create_tables():
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully.")


if __name__ == "__main__":
    create_tables()