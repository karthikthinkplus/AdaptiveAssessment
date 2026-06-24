from uuid import UUID

from sqlalchemy import and_, not_, select
from sqlalchemy.orm import Session, joinedload

from app.models.question import Question
from app.models.question_option import QuestionOption
from app.models.question_passage import QuestionPassage


class QuestionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_questions(self) -> list[Question]:
        stmt = select(Question).options(joinedload(Question.options)).order_by(Question.created_at.desc())
        return list(self.db.execute(stmt).unique().scalars().all())

    def get_question(self, question_id: UUID) -> Question | None:
        stmt = select(Question).options(joinedload(Question.options)).where(Question.id == question_id)
        return self.db.execute(stmt).unique().scalar_one_or_none()

    def get_question_by_code(self, question_code: str) -> Question | None:
        stmt = select(Question).where(Question.question_code == question_code)
        return self.db.execute(stmt).scalar_one_or_none()

    def create_question(self, question: Question) -> Question:
        self.db.add(question)
        self.db.flush()
        self.db.refresh(question)
        return question

    def create_option(self, option: QuestionOption) -> QuestionOption:
        self.db.add(option)
        self.db.flush()
        return option

    def get_passage_by_code(self, passage_code: str) -> QuestionPassage | None:
        stmt = select(QuestionPassage).where(QuestionPassage.passage_code == passage_code)
        return self.db.execute(stmt).scalar_one_or_none()

    def create_passage(self, passage: QuestionPassage) -> QuestionPassage:
        self.db.add(passage)
        self.db.flush()
        self.db.refresh(passage)
        return passage

    def list_candidate_questions(
        self,
        topic_id: UUID,
        subtopic_id: UUID | None,
        excluded_question_ids: list[UUID],
        difficulty_levels: list[str],
    ) -> list[Question]:
        conditions = [Question.topic_id == topic_id, Question.status == "approved"]
        if subtopic_id:
            conditions.append(Question.subtopic_id == subtopic_id)
        if difficulty_levels:
            # Map levels to both lowercase and title-case (e.g. 'easy' -> 'easy', 'Easy')
            expanded = []
            for d in difficulty_levels:
                expanded.append(d.lower())
                expanded.append(d.capitalize())
            conditions.append(Question.difficulty_level.in_(expanded))
        if excluded_question_ids:
            conditions.append(not_(Question.id.in_(excluded_question_ids)))
        stmt = select(Question).options(joinedload(Question.options)).where(and_(*conditions))
        return list(self.db.execute(stmt).unique().scalars().all())
