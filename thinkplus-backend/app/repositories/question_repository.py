from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.question import Question
from app.repositories.base import Repository


class QuestionRepository(Repository[Question]):
    model = Question

    def list_active_for_subtopic(self, subtopic_id: UUID) -> list[Question]:
        return list(
            self.db.scalars(
                select(Question)
                .options(selectinload(Question.options))
                .where(Question.subtopic_id == subtopic_id, Question.is_active.is_(True), Question.deleted_at.is_(None))
            ).all()
        )
