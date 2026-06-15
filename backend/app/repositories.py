from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Generic, TypeVar
from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, selectinload

from app import models as m
from app.shared.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class Repository(Generic[ModelT]):
    model: type[ModelT]

    def __init__(self, db: Session) -> None:
        self.db = db

    def get(self, entity_id: UUID, *, include_deleted: bool = False) -> ModelT | None:
        stmt: Select[tuple[ModelT]] = select(self.model).where(self.model.id == entity_id)
        if hasattr(self.model, "deleted_at") and not include_deleted:
            stmt = stmt.where(self.model.deleted_at.is_(None))
        return self.db.scalar(stmt)

    def list(self, *, limit: int = 100, offset: int = 0) -> Sequence[ModelT]:
        stmt: Select[tuple[ModelT]] = select(self.model)
        if hasattr(self.model, "deleted_at"):
            stmt = stmt.where(self.model.deleted_at.is_(None))
        return self.db.scalars(stmt.order_by(self.model.created_at.desc()).offset(offset).limit(limit)).all()

    def add(self, entity: ModelT) -> ModelT:
        self.db.add(entity)
        self.db.flush()
        return entity

    def soft_delete(self, entity: ModelT) -> ModelT:
        entity.deleted_at = datetime.now(UTC)
        self.db.flush()
        return entity


class UserRepository(Repository[m.User]):
    model = m.User

    def get_by_email(self, email: str) -> m.User | None:
        return self.db.scalar(select(m.User).where(m.User.email == email.lower(), m.User.deleted_at.is_(None)))


class StudentRepository(Repository[m.Student]):
    model = m.Student

    def get_by_user_id(self, user_id: UUID) -> m.Student | None:
        return self.db.scalar(select(m.Student).where(m.Student.user_id == user_id, m.Student.deleted_at.is_(None)))


class TeacherRepository(Repository[m.Teacher]):
    model = m.Teacher


class TopicRepository(Repository[m.Topic]):
    model = m.Topic


class SubtopicRepository(Repository[m.Subtopic]):
    model = m.Subtopic

    def list_for_topic(self, topic_id: UUID) -> list[m.Subtopic]:
        return list(
            self.db.scalars(
                select(m.Subtopic)
                .where(m.Subtopic.topic_id == topic_id, m.Subtopic.deleted_at.is_(None))
                .order_by(m.Subtopic.sequence_order, m.Subtopic.created_at)
            ).all()
        )


class QuestionRepository(Repository[m.Question]):
    model = m.Question

    def get_with_options(self, question_id: UUID) -> m.Question | None:
        return self.db.scalar(
            select(m.Question)
            .options(selectinload(m.Question.options))
            .where(m.Question.id == question_id, m.Question.deleted_at.is_(None))
        )

    def list_for_subtopic(self, subtopic_id: UUID, *, active_only: bool = False) -> list[m.Question]:
        stmt = (
            select(m.Question)
            .options(selectinload(m.Question.options))
            .where(m.Question.subtopic_id == subtopic_id, m.Question.deleted_at.is_(None))
        )
        if active_only:
            stmt = stmt.where(m.Question.is_active.is_(True))
        return list(self.db.scalars(stmt.order_by(m.Question.difficulty_b, m.Question.created_at)).all())


class AssessmentRepository(Repository[m.Assessment]):
    model = m.Assessment


class AttemptRepository(Repository[m.AssessmentAttempt]):
    model = m.AssessmentAttempt


class LearningSessionRepository(Repository[m.LearningSession]):
    model = m.LearningSession


class ResponseRepository(Repository[m.StudentResponse]):
    model = m.StudentResponse

    def list_for_session(self, session_id: UUID) -> list[m.StudentResponse]:
        return list(
            self.db.scalars(
                select(m.StudentResponse)
                .where(m.StudentResponse.learning_session_id == session_id, m.StudentResponse.deleted_at.is_(None))
                .order_by(m.StudentResponse.created_at)
            ).all()
        )


class AdaptiveRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def bkt_state(self, student_id: UUID, subtopic_id: UUID) -> m.StudentBKTState | None:
        return self.db.scalar(
            select(m.StudentBKTState).where(
                m.StudentBKTState.student_id == student_id,
                m.StudentBKTState.subtopic_id == subtopic_id,
                m.StudentBKTState.deleted_at.is_(None),
            )
        )

    def theta(self, student_id: UUID, topic_id: UUID) -> m.StudentTopicTheta | None:
        return self.db.scalar(
            select(m.StudentTopicTheta).where(
                m.StudentTopicTheta.student_id == student_id,
                m.StudentTopicTheta.topic_id == topic_id,
                m.StudentTopicTheta.deleted_at.is_(None),
            )
        )

    def answered_question_ids(self, learning_session_id: UUID) -> set[UUID]:
        return set(
            self.db.scalars(
                select(m.StudentResponse.question_id).where(
                    m.StudentResponse.learning_session_id == learning_session_id,
                    m.StudentResponse.deleted_at.is_(None),
                )
            ).all()
        )

    def aggregate_count(self, model: type[Base]) -> int:
        return int(self.db.scalar(select(func.count(model.id)).where(model.deleted_at.is_(None))) or 0)
